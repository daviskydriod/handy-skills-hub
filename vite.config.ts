import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // ✅ -swc not just -react
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"], // ✅ keep this
  },
});
