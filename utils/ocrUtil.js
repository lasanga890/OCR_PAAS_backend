import fs from 'fs';
import path from 'path';
import { PDFExtract } from 'pdf.js-extract';
import Tesseract from 'tesseract.js';
import { Poppler } from 'node-poppler';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processOCR = async (filePath, fileName) => {
  let textLines = []; // Store text as an array of lines
  let pagesProcessed = 0;
  let isScanned = false;

  // Try text extraction with pdf.js-extract
  const pdfExtract = new PDFExtract();
  const options = {};
  try {
    const data = await pdfExtract.extract(filePath, options);
    let text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
    pagesProcessed = data.pages.length;

    // Split text into lines and filter out empty lines
    textLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // If minimal text, assume scanned and use Tesseract
    if (textLines.length === 0 || textLines.join('').length < 100) {
      isScanned = true;
      textLines = [];
      const tempDir = path.join(__dirname, '../../temp_images');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      // Use node-poppler to convert PDF to PNG
      const poppler = new Poppler();
      const opts = {
        pngFile: true,
        firstPageToConvert: 1 // Process from the first page
        // Omit lastPageToConvert to process all pages
      };
      const outputFilePrefix = path.join(tempDir, 'page');
      await poppler.pdfToCairo(filePath, outputFilePrefix, opts);

      // Read generated image files
      const imageFiles = fs.readdirSync(tempDir).filter(f => f.startsWith('page') && f.endsWith('.png'));
      pagesProcessed = imageFiles.length;

      for (const imgFile of imageFiles) {
        const imgPath = path.join(tempDir, imgFile);
        const { data: { text: pageText } } = await Tesseract.recognize(imgPath, 'eng', {
          tessedit_pageseg_mode: 6 // Improve line segmentation
        });
        // Split page text into lines and filter out empty lines
        const pageLines = pageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        textLines.push(...pageLines);
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

    // If no lines were extracted, return a default message
    if (textLines.length === 0) {
      textLines = ['No text extracted'];
    }

    // Calculate total characters from all lines
    const charactersCount = textLines.join('').length;

    return { text: textLines, pagesProcessed, charactersCount, isScanned };
  } catch (err) {
    console.error('OCR processing error:', err);
    throw err;
  }
};