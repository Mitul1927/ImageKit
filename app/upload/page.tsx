"use client";
import { useState,useEffect } from "react";
import FileUpload from "../components/FileUpload";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  fileType: string;
  fileId?: string;
  thumbnailUrl?: string;
  fileExtension: string;
}

interface ImageKitResponse {
  name: string;
  url: string;
  size?: number;
  fileId?: string;
}


export default function UploadPage() {
  const { status } = useSession();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);

  
  useEffect(() => {
    const fetchUserPlanAndFiles = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUserPlan(data.tier); 

        const fileRes = await fetch("/api/files");
        const filesData = await fileRes.json();
        setExistingFiles(filesData);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    if (status === "authenticated") fetchUserPlanAndFiles();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-600 mb-6">Please sign in to upload files</p>
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

  const handleUploadSuccess = async (response: ImageKitResponse) => {
    console.log("ImageKit upload response:", response);
    const uploadLimit = userPlan === "pro" ? 10 : 2;

    if (existingFiles.length >= uploadLimit) {
      setUploadError(
        userPlan === "pro"
          ? "You’ve reached your 10-file limit for the Pro plan."
          : "Upload limit reached. Upgrade to Pro for 10 files."
      );
      return;
    }

    try {
      const fileExtension =
        response.name.split(".").pop()?.toLowerCase() || "unknown";
      const isImage = ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(
        fileExtension
      );
      const isVideo = ["mp4", "mov", "avi", "webm", "mkv"].includes(
        fileExtension
      );
      const fileType = isImage ? "image" : isVideo ? "video" : "document";
      const thumbnailUrl = isImage
        ? `${response.url}?tr=w-200,h-200,c-at_max` 
        : response.url;

      const fileData = {
        url: response.url,
        name: response.name,
        size: response.size || 0,
        fileType: fileType,
        fileId: response.fileId,
        thumbnailUrl: thumbnailUrl,
        fileExtension: fileExtension,
      };

      const saveResponse = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileData.name,
          url: fileData.url,
          thumbnailUrl: fileData.thumbnailUrl,
          description: `Uploaded ${fileType}: ${fileData.name}`,
          fileExtension: fileData.fileExtension,
          fileType: fileData.fileType,
          size: fileData.size,
        }),
      });

      if (saveResponse.ok) {
        const savedFile = await saveResponse.json();
        console.log("File saved to database:", savedFile);

        setUploadedFiles((prev) => [...prev, fileData]);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadError(null);

        alert(
          `${
            fileType.charAt(0).toUpperCase() + fileType.slice(1)
          } uploaded and saved successfully!`
        );
      } else {
        throw new Error("Failed to save file to database");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      setUploadError(
        "File uploaded to ImageKit but failed to save to database"
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
    setIsUploading(true);
    setUploadError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("File dropped:", e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Files
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload images, videos, and documents to MediaFlow Pro. All files are
            automatically optimized and stored securely with ImageKit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Choose Your Files
                </h2>

                <p className="text-gray-600 mb-8">
                  Select images, videos, or documents to upload. Maximum file
                  size: 100MB
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Plan: <span className="font-semibold capitalize">{userPlan}</span> — You can upload up to{" "}
                  <span className="font-semibold">
                    {userPlan === "pro" ? 10 : 2}
                  </span>{" "}
                  files.
                </p>

                <div
                  className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg text-gray-600 mb-2">
                      Drag and drop files here, or
                    </p>
                    <FileUpload
                      OnSuccess={(res: unknown) =>
                        handleUploadSuccess(res as UploadedFile)
                      }
                      OnProgress={handleUploadProgress}
                      fileType="image"
                    />
                    <p className="text-sm text-gray-500 mt-4">
                      Supports: Images (JPG, PNG, GIF), Videos (MP4, MOV),
                      Documents (PDF, DOC, XLS)
                    </p>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{uploadError}</p>
                  </div>
                )}
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Recently Uploaded
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {file.fileType === "image" ? (
                            <Image
                              src={file.url}
                              alt={file.name}
                              width={60}
                              height={60}
                              className="w-15 h-15 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-400">
                              {new Date().toLocaleDateString()}
                            </span>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/files"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    View All Files
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Maximum file size: 100MB
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Images are automatically optimized
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Videos are stream-ready
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  All files are securely stored
                </li>
              </ul>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Supported Formats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                  <div>
                    <div className="font-medium text-gray-900">Images</div>
                    <div className="text-sm text-gray-500">
                      JPG, PNG, GIF, SVG
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-purple-600"
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
                  <div>
                    <div className="font-medium text-gray-900">Videos</div>
                    <div className="text-sm text-gray-500">MP4, MOV, AVI</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                  <div>
                    <div className="font-medium text-gray-900">Documents</div>
                    <div className="text-sm text-gray-500">
                      PDF, DOC, XLS, PPT
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/files"
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  View All Files
                </Link>
                <Link
                  href="/upload-test"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                  Test Upload
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
