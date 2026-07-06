import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (development, production, etc.)
  // Passing '' as the 3rd argument allows loading variables without the VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback to localhost if the variable isn't defined
  const targetUrl = env.NEXT_PUBLIC_EXPRESS_SERVER_URL || "http://localhost:4000";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/auth": { target: targetUrl, changeOrigin: true },
        "/chat": { target: targetUrl, changeOrigin: true },
        "/chatbot": { target: targetUrl, changeOrigin: true },
        "/users": { target: targetUrl, changeOrigin: true },
        "/knhanes": { target: targetUrl, changeOrigin: true },
        "/healthstatus": { target: targetUrl, changeOrigin: true },
        "/health-records": { target: targetUrl, changeOrigin: true },
        "/routines": { target: targetUrl, changeOrigin: true },
        "/chats": { target: targetUrl, changeOrigin: true },
        "/files": { target: targetUrl, changeOrigin: true },
      },
    },
  };
});