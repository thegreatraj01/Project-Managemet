import express from "express";
import cors from "cors";
const app = express();

//Basic configurations
app.use(express.json({ limit: "16kb" })); // except json data
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //
app.use(express.static("public")); // serve static files from the "public" directory

// cors configuration
app.use(
   cors({
      origin: process.env.CORS_ORIGIN?.split(",") || "*", // Allow requests from the specified origin(s) or all origins if not specified
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow only GET, POST, PUT, PATCH, and DELETE methods
      headers: ["Content-Type", "Authorization"], // Allow only Content-Type and Authorization headers
   }),
);

app.get("/", (req, res) => {
   res.send("Hello World!");
});

export default app;
