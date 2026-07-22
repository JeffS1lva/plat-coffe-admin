import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
// base: '/admin/' porque em produção este projeto é servido sob o mesmo
// domínio da loja (ex: seusite.com/admin) — é assim que login e pedidos
// conseguem compartilhar o localStorage entre os dois projetos separados.
export default defineConfig({
  base: "/admin/",
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})