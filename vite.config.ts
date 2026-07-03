import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/auth": { target: "http://localhost:4000", changeOrigin: true },
      "/chat": { target: "http://localhost:4000", changeOrigin: true },
      "/chatbot": { target: "http://localhost:4000", changeOrigin: true },
      "/users": { target: "http://localhost:4000", changeOrigin: true },
      "/knhanes": { target: "http://localhost:4000", changeOrigin: true },
      "/healthstatus": { target: "http://localhost:4000", changeOrigin: true },
      "/health-records": { target: "http://localhost:4000", changeOrigin: true },
      "/routines": { target: "http://localhost:4000", changeOrigin: true },
      "/chats": { target: "http://localhost:4000", changeOrigin: true },
      "/files": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
