import fs from "fs";
import path from "path";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const parseDocument = async (req, res) => {
  try {
    if (req.body.text) {
      return res.json({
        success: true,
        text: req.body.text,
        source: "pasted",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded and no text provided",
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let extractedText = "";

    switch (fileExtension) {
      case ".txt":
        extractedText = fs.readFileSync(filePath, "utf-8");
        break;

      case ".pdf":
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;
        break;

      case ".docx":
        const docxResult = await mammoth.extractRawText({ path: filePath });
        extractedText = docxResult.value;
        break;

      default:
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          error: `Unsupported file format: ${fileExtension}`,
        });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      text: extractedText.trim(),
      source: "file",
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("Document parsing error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: `Failed to parse document: ${error.message}`,
    });
  }
};
