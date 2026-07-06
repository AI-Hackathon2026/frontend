import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


const endpoint = "https://heaith.ddns.net";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/auth": { target: endpoint, changeOrigin: true },
      "/chat": { target: endpoint, changeOrigin: true },
      "/chatbot": { target: endpoint, changeOrigin: true },
      "/users": { target: endpoint, changeOrigin: true },
      "/knhanes": { target: endpoint, changeOrigin: true },
      "/healthstatus": { target: endpoint, changeOrigin: true },
      "/health-records": { target: endpoint, changeOrigin: true },
      "/routines": { target: endpoint, changeOrigin: true },
      "/chats": { target: endpoint, changeOrigin: true },
      "/files": { target: endpoint, changeOrigin: true },
    },
  },
});
