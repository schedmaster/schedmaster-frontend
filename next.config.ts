import type { NextConfig } from "next";

const apiImageOrigin = (() => {
  try {
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api");

    return {
      protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      pathname: "/imagenes/**",
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/imagenes/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/imagenes/**",
      },
      {
        protocol: "https",
        hostname: "schedmaster-backend.onrender.com",
        pathname: "/imagenes/**",
      },
      ...(apiImageOrigin ? [apiImageOrigin] : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: http://localhost:3001 http://127.0.0.1:3001 https://schedmaster-backend.onrender.com https://res.cloudinary.com",
              "connect-src 'self' http://localhost:3001 https://schedmaster-backend.onrender.com https://159.65.111.84.sslip.io",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'"
            ].join("; ")
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin"
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin"
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
