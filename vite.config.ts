import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? "https://phoenixsystems.online";

  return {
    base: mode === "production" ? "/property_manager/" : "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/property_api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
