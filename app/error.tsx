"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <h1
        style={{
          fontSize: 28,
          marginBottom: 8,
        }}
      >
        Something went wrong
      </h1>

      <p
        style={{
          color: "#666",
          maxWidth: 680,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        We encountered an unexpected error while loading this page.  
        You can try again or go back to the homepage.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          onClick={() => reset()}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Try again
        </button>

        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "transparent",
            color: "#2563eb",
            border: "1px solid #2563eb",
            padding: "10px 16px",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
