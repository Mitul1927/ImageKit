"use client" // This component must be a client component

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { useRef, useState } from "react";
interface FileUploadProps{
    OnSuccess: (res:any) => void
    OnProgress ?: (progress:number) => void
    fileType?: "image" | "video"
}
const FileUpload = ({OnSuccess,OnProgress,fileType}:FileUploadProps) => {
    // const [progress, setProgress] = useState(0);
    // const fileInputRef = useRef<HTMLInputElement>(null);
    // const abortController = new AbortController();

    // const authenticator = async () => {
    //     try {
    //         const response = await fetch("/api/upload-auth");
    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    //         }
    //         const data = await response.json();
    //         const { signature, expire, token, publicKey } = data;
    //         return { signature, expire, token, publicKey };
    //     } catch (error) {
    //         console.error("Authentication error:", error);
    //         throw new Error("Authentication request failed");
    //     }
    // };

    // const handleUpload = async () => {
    //     const fileInput = fileInputRef.current;
    //     if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    //         alert("Please select a file to upload");
    //         return;
    //     }
    //     const file = fileInput.files[0];
    //     let authParams;
    //     try {
    //         authParams = await authenticator();
    //     } catch (authError) {
    //         console.error("Failed to authenticate for upload:", authError);
    //         return;
    //     }
    //     const { signature, expire, token, publicKey } = authParams;
    //     try {
    //         const uploadResponse = await upload({
    //             expire,
    //             token,
    //             signature,
    //             publicKey,
    //             file,
    //             fileName: file.name, 
    //             onProgress: (event) => {
    //                 setProgress((event.loaded / event.total) * 100);
    //             },
    //             abortSignal: abortController.signal,
    //         });
    //         console.log("Upload response:", uploadResponse);
    //     } catch (error) {
    //         if (error instanceof ImageKitAbortError) {
    //             console.error("Upload aborted:", error.reason);
    //         } else if (error instanceof ImageKitInvalidRequestError) {
    //             console.error("Invalid request:", error.message);
    //         } else if (error instanceof ImageKitUploadNetworkError) {
    //             console.error("Network error:", error.message);
    //         } else if (error instanceof ImageKitServerError) {
    //             console.error("Server error:", error.message);
    //         } else {
    //             console.error("Upload error:", error);
    //         }
    //     }
    const [uploading,setUploading] = useState(false);
    const [error,setError] = useState<string | null>(null);
    // optional validation

    const validateFile = (file:File) =>{
        if(fileType==="video"){
            if(!file.type.startsWith("video/")){
                setError("Please upload a valid video file");
            }
        }
        if(file.size>100*1024*1024){
            setError("File size must be less than 100 MB");
        }
        return true;
    }

    return (
        <>
            <input type="file" accept={fileType==="video" ? "video/*" : "image/*"}
            onChange={handleFileChange} />
        </>
    );
};

export default FileUpload;