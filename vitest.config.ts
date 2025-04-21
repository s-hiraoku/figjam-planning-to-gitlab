/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Optional: Use if you want global APIs like describe, it, expect
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts", // Path to your setup file
    exclude: [
      "node_modules",
      "firecrawl-mcp-server/**", // Exclude the MCP server directory
      // Add any other directories/files to exclude here
    ],
    // Add any other test-specific options here
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"), // Replicate the tsconfig path alias
    },
  },
});
