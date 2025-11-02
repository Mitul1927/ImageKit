"use client";

import { upload } from "@imagekit/next";
import { useState, useEffect } from "react";

interface FileUploadProps {
  OnSuccess: (res: unknown) => void;
  OnProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

interface UploadedFile {
  _id: string;
  name: string;
  url: string;
  size: number;
  fileType: "image" | "video" | "document";
  fileExtension: string;
  thumbnailUrl?: string;
  createdAt: string;
}

const FileUpload = ({ OnSuccess, OnProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const [userRes, filesRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/files")
        ]);
        const userData = await userRes.json();
        const filesData = await filesRes.json();
        setUserTier(userData?.user?.tier || "free");
        setExistingFiles(filesData || []);
      } catch (err) {
        console.error("Error fetching user or files:", err);
      }
    };
    fetchUserInfo();
  }, []);

  const validateFile = (file: File) => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
      return false;
    }

    const limit = userTier === "free" ? 2 : 10;
    if (existingFiles.length >= limit) {
      setError(`Upload limit reached (${limit} files). Upgrade your plan for more.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      const authRes = await fetch("/api/auth/imageKit-auth");
      const { authenticationParameters, publicKey } = await authRes.json();

      const res = await upload({
        ...authenticationParameters,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          if (event.lengthComputable && OnProgress) {
            const percent = (event.loaded / event.total) * 100;
            OnProgress(Math.round(percent));
          }
        },
      });

      OnSuccess(res);
    } catch (error) {
      console.error("Upload failed", error);
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
      />
      {uploading && <span>Loading...</span>}
      {error && <span>{error}</span>}
    </>
  );
};

export default FileUpload;
