import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { parseDocument, getDocuments } from "../controllers/document.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", upload.single("document"), parseDocument);
router.get("/", getDocuments);

export default router;
