import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = (
    env.VITE_EXPRESS_SERVER_URL?.trim() || "http://localhost:4000"
  ).replace(/\/$/, "");

  const apiProxy = {
    target: backendTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  };

  return {
    plugins: [
      react(),
      VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon.svg",
        "favicon-32x32.png",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "HeAIth — AI Health Platform",
        short_name: "HeAIth",
        description: "AI 기반 건강 루틴과 상담 플랫폼",
        theme_color: "#0d1b2a",
        background_color: "#0d1b2a",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        lang: "ko",
        categories: ["health", "medical", "lifestyle"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "cdn-assets",
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
    ],
    server: {
      port: 3000,
      proxy: {
        "/api": apiProxy,
      },
    },
    preview: {
      port: 3000,
      proxy: {
        "/api": apiProxy,
      },
    },
  };
});
