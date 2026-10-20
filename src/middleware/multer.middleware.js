import multer from "multer";
import { randomUUID } from "node:crypto";
import { extname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const uploadDirectory = resolve(process.cwd(), "public", "images");
// Ensure the destination exists before Multer writes uploaded files.
mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, uploadDirectory);
   },
   filename: function (req, file, cb) {
      // Avoid filename collisions while preserving the file extension.
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
   },
});

export const upload = multer({
   storage,
   limits: {
      // Limit each attachment to 1 MiB.
      fileSize: 1 * 1024 * 1024,
   },
});
