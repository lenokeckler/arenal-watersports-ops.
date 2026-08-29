import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["node_modules", ".next", "docs"],
    // El cliente de Supabase valida la forma de la URL al construirse. Sin
    // esto la prueba fallaría por falta de entorno y no por lo que mide.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        "local-anon-key-for-tests",
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
