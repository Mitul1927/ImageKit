"use client"; // This component must be a client component

import { upload } from "@imagekit/next";
import { useState } from "react";
interface FileUploadProps {
  OnSuccess: (res: unknown) => void;
  OnProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}
const FileUpload = ({ OnSuccess, OnProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // optional validation

  const validateFile = (file: File) => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
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
        ...authenticationParameters, // token, signature, expire
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
