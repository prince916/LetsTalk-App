import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-icons")) return "icons";
          if (id.includes("emoji-picker-react")) return "emoji-picker";
          if (id.includes("socket.io-client") || id.includes("engine.io-client")) return "socket-io";
          if (id.includes("socket.io")) return "socket-io";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react-router") ||
            id.includes("react-hot-toast") ||
            id.includes("react-hook-form")
          ) {
            return "react-vendor";
          }
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 4001,
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5002",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5002",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});