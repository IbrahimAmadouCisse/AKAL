import { defineConfig } from "vitest/config";

// Tests unitaires purs (mappers, filtres) — pas de DOM requis, donc pas de
// jsdom/happy-dom ici. resolve.tsconfigPaths résout les alias "@/*" du tsconfig.json.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
