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
import notesRouter from "./routes/notes.routes.js";

app.use("/api/v1/healthcheck", healthCheckRoute);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", notesRouter);

app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "Route not found",
      errors: [],
   });
});

// Global error handling middleware
app.use((error, req, res, next) => {
   if (res.headersSent) {
      return next(error);
   }

   console.error(error);

   const isMulterError = error.name === "MulterError";
   const statusCode =
      error.statusCode ||
      error.status ||
      (isMulterError
         ? error.code === "LIMIT_FILE_SIZE"
            ? 413
            : 400
         : error.code === 11000
           ? 409
           : error.name === "CastError"
             ? 400
             : error.name === "ValidationError"
               ? 422
               : 500);

   const message =
      isMulterError && error.code === "LIMIT_FILE_SIZE"
         ? "Each attachment must be 1 MB or smaller"
         : isMulterError && error.code === "LIMIT_UNEXPECTED_FILE"
           ? "Use the 'attachments' field and upload no more than 5 files"
           : error.message || "Internal server error";

   res.status(statusCode).json({
      success: false,
      message,
      errors: error.errors || [],
   });
});

export default app;
