import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/barcode-db/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://api:5000",
        changeOrigin: true,
      },
    },
  },
});
