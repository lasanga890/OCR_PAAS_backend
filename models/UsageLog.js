
import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  fileName: { type: String, required: true },
  pagesProcessed: { type: Number, required: true },
  charactersCount: { type: Number, required: true }
});

export default mongoose.model('UsageLog', usageLogSchema);
