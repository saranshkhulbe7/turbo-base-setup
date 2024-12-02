import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/trpc": {
        target: "http://localhost:4500", // Proxy target
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/trpc/, "/trpc"), // Rewrite the path if necessary
      },
    },
  },
});
