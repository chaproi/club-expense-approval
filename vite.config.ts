import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    root: "client",
    esbuild: { jsx: "automatic" },
    server: {
      port: 5173,
      strictPort: true,
      proxy: { "/api": `http://127.0.0.1:${env.PORT || "3000"}` },
    },
    build: { outDir: "../dist/client", emptyOutDir: true },
  };
});
