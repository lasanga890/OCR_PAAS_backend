import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import UsageLog from '../models/UsageLog.js';
import { processOCR } from '../utils/ocrUtil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

export const ocrUpload = upload.single('pdf');
export const processOcr = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No PDF uploaded' });
  try {
    const { text, pagesProcessed, charactersCount } = await processOCR(req.file.path, req.file.originalname);
    // const log = new UsageLog({
    //   userId: req.user._id,
    //   fileName: req.file.originalname,
    //   pagesProcessed,
    //   charactersCount
    // });
    // await log.save();
    // await req.user.updateOne({ $push: { usage: log._id } });
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'OCR processing error' });
  }
};