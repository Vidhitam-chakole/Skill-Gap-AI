/**
 * Server Entry Point
 */

// Set required env vars BEFORE any other imports
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production-1234567890abcdef";
if (!process.env.PORT || process.env.PORT === "0") process.env.PORT = "3001";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = "http://localhost:5173";

import path from "path";

async function main() {
  const { initDb } = await import("./db/database.js");

  await initDb();
  console.log("📦 Database initialized with tables");

  const { default: app } = await import("./app.js");
  const { env } = await import("./config/env.js");

  const PORT = env.PORT;

  app.listen(PORT, () => {
    console.log(`🚀 Skill+ API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
