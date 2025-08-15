import fs from 'fs';
import path from 'path';
import { PDFExtract } from 'pdf.js-extract'; // Assuming you switched to pdf.js-extract from previous fix
import Tesseract from 'tesseract.js';
import { Poppler } from 'node-poppler'; // Import node-poppler
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processOCR = async (filePath, fileName) => {
  let text = '';
  let pagesProcessed = 0;
  let isScanned = false;

  // Try text extraction with pdf.js-extract
  const pdfExtract = new PDFExtract();
  const options = {};
  try {
    const data = await pdfExtract.extract(filePath, options);
    text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n').trim();
    pagesProcessed = data.pages.length;

    // If minimal text, assume scanned and use Tesseract
    if (text.length < 100) {
      isScanned = true;
      text = '';
      const tempDir = path.join(__dirname, '../../temp_images');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      // Use node-poppler to convert PDF to PNG
      const poppler = new Poppler();
      const opts = {
        pngFile: true,
        firstPageToConvert: 1,
        lastPageToConvert: null, // Convert all pages
      };
      const outputFilePrefix = path.join(tempDir, 'page');
      await poppler.pdfToCairo(filePath, outputFilePrefix, opts);

      // Read generated image files
      const imageFiles = fs.readdirSync(tempDir).filter(f => f.startsWith('page') && f.endsWith('.png'));
      pagesProcessed = imageFiles.length;

      for (const imgFile of imageFiles) {
        const imgPath = path.join(tempDir, imgFile);
        const { data: { text: pageText } } = await Tesseract.recognize(imgPath, 'eng');
        text += pageText + '\n\n';
        try {
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error('Error deleting image file:', imgPath, err);
        }
      }

      try {
        fs.rmdirSync(tempDir, { recursive: true });
      } catch (err) {
        console.error('Error deleting temp directory:', tempDir, err);
      }
    }

    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting PDF file:', filePath, err);
    }

    return { text: text.trim(), pagesProcessed, charactersCount: text.length, isScanned };
  } catch (err) {
    console.error('OCR processing error:', err);
    throw err;
  }
};