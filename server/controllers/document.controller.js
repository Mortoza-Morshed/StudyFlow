import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import Document from "../models/Document.model.js";

/**
 * Extract text from a PDF buffer using pdfjs-dist directly.
 */
async function extractTextFromPdf(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8Array = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({
    data: uint8Array,
    verbosity: 0,
  }).promise;

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    const items = textContent.items
      .filter((item) => "str" in item && item.str.trim().length > 0)
      .map((item) => {
        const tx = item.transform;
        const [x, y] = viewport.convertToViewportPoint(tx[4], tx[5]);
        return {
          text: item.str.trim(),
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          height: Math.abs(tx[3]) || 12,
        };
      });

    if (items.length === 0) {
      page.cleanup();
      continue;
    }

    items.sort((a, b) => {
      const yDiff = a.y - b.y;
      if (Math.abs(yDiff) < a.height * 0.5) return a.x - b.x;
      return yDiff;
    });

    const lines = [];
    let currentLine = [items[0]];

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const prevItem = currentLine[currentLine.length - 1];

      if (Math.abs(item.y - prevItem.y) <= item.height * 0.5) {
        currentLine.push(item);
      } else {
        lines.push(currentLine);
        currentLine = [item];
      }
    }
    lines.push(currentLine);

    const lineTexts = [];
    let prevLineY = null;

    for (const line of lines) {
      const lineText = line.map((item) => item.text).join(" ");
      const lineY = line[0].y;
      const lineHeight = line[0].height;

      const lower = lineText.toLowerCase();
      if (/^session\s+\d{4}/i.test(lower) || /^page\s*:\s*\d+\s*\/\s*\d+/i.test(lower)) {
        continue;
      }

      if (prevLineY !== null && Math.abs(lineY - prevLineY) > lineHeight * 1.8) {
        lineTexts.push("");
      }

      lineTexts.push(lineText);
      prevLineY = lineY;
    }

    pageTexts.push(lineTexts.join("\n"));
    page.cleanup();
  }

  await doc.destroy();
  return pageTexts.join("\n\n");
}

export const parseDocument = async (req, res) => {
  try {
    let extractedText = "";
    let source = "";
    let filename = "";
    let title = "";

    if (req.body.text) {
      extractedText = req.body.text;
      source = "pasted";
      title = extractedText.split("\n")[0].substring(0, 50) || "Pasted Text";
    } else if (req.file) {
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      filename = req.file.originalname;
      title = filename;
      source = "file";

      switch (fileExtension) {
        case ".txt":
          extractedText = fs.readFileSync(filePath, "utf-8");
          break;
        case ".pdf":
          const pdfBuffer = fs.readFileSync(filePath);
          extractedText = await extractTextFromPdf(pdfBuffer);
          break;
        case ".docx":
          const docxResult = await mammoth.extractRawText({ path: filePath });
          extractedText = docxResult.value;
          break;
        default:
          fs.unlinkSync(filePath);
          return res.status(400).json({ success: false, error: "Unsupported format" });
      }
      fs.unlinkSync(filePath);
    } else {
      return res.status(400).json({ success: false, error: "No content provided" });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ success: false, error: "Empty content" });
    }

    // Persist to DB
    const newDoc = await Document.create({
      title,
      text: extractedText,
      source,
      filename,
    });

    res.json({
      success: true,
      id: newDoc._id,
      text: extractedText.trim(),
      source,
      filename,
      title: newDoc.title,
    });
  } catch (error) {
    console.error("Parse error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
