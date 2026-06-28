import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

/** Replaces %VITE_*% placeholders in firebase-messaging-sw.js with env values. */
function serviceWorkerEnvPlugin(): Plugin {
  const SW_FILE = "firebase-messaging-sw.js";
  let env: Record<string, string> = {};

  return {
    name: "sw-env-inject",

    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), "VITE_");
    },

    // Dev: intercept requests for the SW and serve substituted content
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== `/${SW_FILE}`) return next();
        const swPath = path.resolve(__dirname, "public", SW_FILE);
        let content = fs.readFileSync(swPath, "utf-8");
        content = content.replace(/%(\w+)%/g, (_, key) => env[key] ?? "");
        res.setHeader("Content-Type", "application/javascript");
        res.end(content);
      });
    },

    // Build: rewrite the copied file in dist/
    closeBundle() {
      const swDist = path.resolve(__dirname, "dist", SW_FILE);
      if (!fs.existsSync(swDist)) return;
      let content = fs.readFileSync(swDist, "utf-8");
      content = content.replace(/%(\w+)%/g, (_, key) => env[key] ?? "");
      fs.writeFileSync(swDist, content);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerEnvPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@features": path.resolve(__dirname, "src/features"),
      "@redux": path.resolve(__dirname, "src/redux"),
      "@helpers": path.resolve(__dirname, "src/helpers")
    },
  },
});
