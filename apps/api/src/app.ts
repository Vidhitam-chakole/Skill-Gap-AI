/**
 * Express Application Setup
 * Configures middleware, routes, and error handling.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";

// Routes
import authRoutes from "./routes/auth.js";
import reposRoutes from "./routes/repos.js";
import skillsRoutes from "./routes/skills.js";
import architectureRoutes from "./routes/architecture.js";
import qualityRoutes from "./routes/quality.js";
import reportRoutes from "./routes/report.js";
import recommendationsRoutes from "./routes/recommendations.js";
import roadmapRoutes from "./routes/roadmap.js";
import mentorRoutes from "./routes/mentor.js";
import workspaceRoutes from "./routes/workspace.js";
import pipelineRoutes from "./routes/pipeline.js";
import historyRoutes from "./routes/history.js";
import settingsRoutes from "./routes/settings.js";
import exportRoutes from "./routes/export.js";

const app = express();

// -- Security --
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// -- Rate Limiting --
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// -- Body Parsing --
app.use(express.json({ limit: "10mb" }));

// -- Health Check --
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "0.1.0" });
});

// -- Routes --
app.use("/api/auth", authRoutes);
app.use("/api/repos", reposRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/architecture", architectureRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/analysis", pipelineRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/export", exportRoutes);

// -- Error Handler --
app.use(errorHandler);

export default app;
