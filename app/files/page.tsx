"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  thumbnailUrl?: string;
  fileExtension: string;
}


type FilterType = "all" | "images" | "videos" | "documents";
type SortField = "name" | "size" | "date";
type SortOrder = "asc" | "desc";

export default function FilesPage() {
  const { status } = useSession();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const btnDownload =
    `${btnBase} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400`;
  const btnShare =
    `${btnBase} bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-300`;
  const btnDelete =
    `${btnBase} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-300`;
  const btnPrimary =
    `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400`;


  const fetchFiles = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/files");
      if (response.ok) {
        const apiFiles = await response.json();

        const transformedFiles: FileItem[] = (apiFiles as FileItem[]).map((file) => ({
          id: file.id,
          name: file.name,
          url: file.url,
          size: Math.floor(Math.random() * 10000000) + 100000, 
          type:
            file.fileExtension === "mp4" || file.fileExtension === "mov"
              ? "video"
              : file.fileExtension === "jpg" ||
                file.fileExtension === "png" ||
                file.fileExtension === "gif" ||
                file.fileExtension === "svg"
              ? "image"
              : "document",
          uploadedAt: file.uploadedAt,
          thumbnailUrl: file.thumbnailUrl,
          fileExtension: file.fileExtension,
        }));

        setFiles(transformedFiles);
        setFilteredFiles(transformedFiles);
      } else {
        console.error("Failed to fetch files");
        setFiles([]);
        setFilteredFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
      setFilteredFiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    let filtered = [...files];

    if (searchQuery) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter((file) => file.type === filter);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "date":
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFiles(filtered);
  }, [files, filter, sortField, sortOrder, searchQuery]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
const handleDelete = async (id: string) => {
  const prev = files;
  setDeletingId(id);
  setFiles(list => list.filter(f => f.id !== id));  

  const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
  if (!res.ok) {
    setFiles(prev);
    console.error("Delete failed");
  }
  setDeletingId(null);
};


const download = (id: string) => {
  window.location.href = `/api/files/${id}`;
};

const share = async (id: string) => {
  setCopyMessage(null);
  setCopyingId(id);

  const res = await fetch(`/api/files/${id}/share`, { method: "POST" });
  if (!res.ok) {
    setCopyingId(null);
    setCopyMessage("Failed to create share link");
    return;
  }
  const { shareUrl } = await res.json();

  try {
    await navigator.clipboard.writeText(shareUrl);
    setCopyMessage("Link copied to clipboard");
    setCopyingId(null);
    return;
  } catch (err) {
    console.warn("navigator.clipboard failed:", err);
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = shareUrl;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (ok) {
      setCopyMessage("Link copied to clipboard");
      setCopyingId(null);
      return;
    }
    throw new Error("execCommand returned false");
  } catch (err) {
    console.warn("execCommand fallback failed:", err);
  }

  try {
    window.prompt("Copy this link", shareUrl);
    setCopyMessage("Use prompt to copy link");
  } catch {
    setCopyMessage("Could not copy automatically — link shown in console");
    console.log("Share URL:", shareUrl);
  } finally {
    setCopyingId(null);
  }
};

  const getFileIcon = (type: string, extension: string) => {
    switch (type) {
      case "image":
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case "video":
        return (
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case "document":
        const docColors = {
          pdf: "bg-red-100 text-red-600",
          docx: "bg-blue-100 text-blue-600",
          xlsx: "bg-green-100 text-green-600",
          pptx: "bg-orange-100 text-orange-600",
          default: "bg-gray-100 text-gray-600",
        };
        const colorClass =
          docColors[extension as keyof typeof docColors] || docColors.default;

        return (
          <div
            className={`w-12 h-12 ${
              colorClass.split(" ")[0]
            } rounded-lg flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${colorClass.split(" ")[1]}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
    }
  };

  const getFileTypeCount = (type: FilterType) => {
    if (type === "all") return files.length;
    return files.filter((file) => file.type === type).length;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your files
          </p>
          <Link
            href="/login"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Files
              </h1>
              <p className="text-xl text-gray-600">
                Manage and organize your uploaded files
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={fetchFiles}
                disabled={refreshing}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <Link
                href="/upload"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
              >
                Upload New File
              </Link>
            </div>
          </div>
        </div>

        {/* File Type Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(["all", "images", "videos", "documents"] as FilterType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                  filter === type
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {getFileTypeCount(type)}
                  </div>
                  <div className="text-sm capitalize">{type}</div>
                </div>
              </button>
            )
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
              >
                {sortOrder === "asc" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-lg transition-colors duration-300 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-lg transition-colors duration-300 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No files found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Upload your first file to get started"}
              </p>
              <Link
                href="/upload"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Upload Files
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredFiles.length} file
                  {filteredFiles.length !== 1 ? "s" : ""} found
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {filter === "all" ? "all files" : `${filter} only`}
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {file.type === "image" && file.thumbnailUrl ? (
                          <Image
                            src={file.thumbnailUrl}
                            alt={file.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            {getFileIcon(file.type, file.fileExtension)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3
                          className="font-medium text-gray-900 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="capitalize bg-gray-200 px-2 py-1 rounded text-xs">
                            {file.fileExtension}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(file.uploadedAt)}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={btnPrimary + " flex-1 text-center"}
                          >
                            View
                          </a>
                          <button
                            onClick={() => download(file.id)}
                            className={btnDownload}
                            aria-label="Download file"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => share(file.id)}
                            className={btnShare}
                            disabled={copyingId === file.id}
                          >
                            {copyingId === file.id ? "Copying…" : "Share"}
                          </button>
                          {copyMessage && copyingId === null && (
                            <div className="text-xs text-gray-500 mt-1">{copyMessage}</div>
                          )}

                          <button
                            onClick={() => handleDelete(file.id)}
                            disabled={deletingId === file.id}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {deletingId === file.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      <div className="flex-shrink-0 mr-4">
                        {file.type === "image" && file.thumbnailUrl ? (
                          <Image
                            src={file.thumbnailUrl}
                            alt={file.name}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover rounded-lg"
                          />
                        ) : (
                          getFileIcon(file.type, file.fileExtension)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="capitalize bg-gray-200 px-2 py-1 rounded text-xs">
                            {file.fileExtension}
                          </span>
                          <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btnPrimary}
                        >
                          View
                        </a>
                        <button onClick={() => download(file.id)} className={btnDownload}>
                          Download
                        </button>
                        <button
                          onClick={() => share(file.id)}
                          className={btnShare}
                          disabled={copyingId === file.id}
                        >
                          {copyingId === file.id ? "Copying…" : "Share"}
                        </button>
                        {copyMessage && copyingId === null && (
                          <div className="text-xs text-gray-500 mt-1">{copyMessage}</div>
                        )}

                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                          className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                          {deletingId === file.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
