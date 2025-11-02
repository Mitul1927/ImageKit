import React from "react";
import Link from "next/link";
import { NextPageContext } from "next";

type Props = {
  statusCode?: number;
};

interface ExtendedError extends Error {
  statusCode?: number;
}

function ErrorPage({ statusCode }: Props) {
  // ...existing code...
  console.error("Pages Router error, statusCode:", statusCode);

  return (
    <html>
      <body>
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
            {statusCode
              ? `${statusCode} — Something went wrong`
              : "Something went wrong"}
          </h1>
          <p
            style={{
              color: "#666",
              maxWidth: 680,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            We encountered an error while loading this page. You can try
            reloading or return to the homepage.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Reload
            </button>

            <Link href="/" legacyBehavior>
              <a
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
              </a>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err as ExtendedError).statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
