// app/upload-test/page.tsx
"use client";
import FileUpload from "@/app/components/FileUpload";

export default function UploadTestPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Test Upload</h1>
      <FileUpload
        fileType="video" // or "image"
        OnProgress={(p) => console.log("progress:", p)}
        OnSuccess={(res) => {
          console.log("upload success:", res);
          alert("Uploaded! Check console for response.");
        }}
      />
    </div>
  );
}