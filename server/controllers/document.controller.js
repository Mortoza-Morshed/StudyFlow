import fs from "fs";
import path from "path";
import mammoth from "mammoth";

/**
 * Extract text from a PDF buffer using pdfjs-dist directly.
 * Preserves layout by sorting text items by visual position.
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

    // Extract all text items with their viewport coordinates
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

    // CRITICAL: Sort by visual position — top to bottom, then left to right
    items.sort((a, b) => {
      const yDiff = a.y - b.y;
      // If items are on roughly the same line (within half line-height), sort by x
      if (Math.abs(yDiff) < a.height * 0.5) return a.x - b.x;
      return yDiff;
    });

    // Group sorted items into lines based on y-position proximity
    const lines = [];
    let currentLine = [items[0]];

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const prevItem = currentLine[currentLine.length - 1];

      if (Math.abs(item.y - prevItem.y) <= item.height * 0.5) {
        // Same line
        currentLine.push(item);
      } else {
        // New line — save current and start fresh
        lines.push(currentLine);
        currentLine = [item];
      }
    }
    lines.push(currentLine);

    // Build text from lines, detecting paragraph breaks
    const lineTexts = [];
    let prevLineY = null;

    for (const line of lines) {
      // Items within a line are already sorted by x from the global sort
      const lineText = line.map((item) => item.text).join(" ");
      const lineY = line[0].y;
      const lineHeight = line[0].height;

      // Skip common header/footer patterns
      const lower = lineText.toLowerCase();
      if (/^session\s+\d{4}/i.test(lower) || /^page\s*:\s*\d+\s*\/\s*\d+/i.test(lower)) {
        continue;
      }

      // Detect paragraph break (gap larger than ~1.5x the line height)
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
        extractedText = await extractTextFromPdf(pdfBuffer);
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

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "Could not extract text from the uploaded file. The file may be empty or image-based.",
      });
    }

    res.json({
      success: true,
      text: extractedText.trim(),
      source: "file",
      filename: req.file.originalname,
    });
  } catch (error) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    console.error("Parse error:", error);
    res.status(500).json({
      success: false,
      error: `Failed to parse document: ${error.message}`,
    });
  }
};
