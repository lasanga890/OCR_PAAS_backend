import express from 'express';
import { ocrUpload, processOcr } from '../controllers/ocrController.js';

const router = express.Router();

router.post('/', ocrUpload, processOcr);

export default router;