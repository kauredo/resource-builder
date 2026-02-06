"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
          backgroundColor: "#faf8f5",
          color: "#2d2a26",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          {/* Simple visual without relying on images that might fail to load */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "1rem",
              backgroundColor: "rgba(107, 144, 128, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            <span role="img" aria-label="Concerned face">
              😟
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 500,
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "#6b6560",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            We ran into an unexpected problem. Please try again or refresh the
            page.
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              className="cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              style={{
                backgroundColor: "#d4665a",
                color: "white",
                border: "none",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
              style={{
                backgroundColor: "transparent",
                color: "#2d2a26",
                border: "1px solid #e5e2de",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.75rem",
                color: "#a09a94",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
