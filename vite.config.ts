import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    tanstackStart({
      server: { entry: "server" },
      prerender: {
        enabled: process.env.VITE_PRERENDER === "true",
        crawlLinks: false,
      },
    }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
    nitro(),
  ],
});
