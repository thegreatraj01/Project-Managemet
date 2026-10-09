import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Cookie middleware
app.use(cookieParser());

// CORS configuration
app.use(
   cors({
      origin: process.env.CORS_ORIGIN?.split(",") || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
   }),
);

// Routes configuration
import healthCheckRoute from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";

app.use("/api/v1/healthcheck", healthCheckRoute);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);

// Global error handling middleware
app.use((error, req, res, next) => {
   console.error(error);

   res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
      errors: error.errors || [],
   });
});

export default app;
