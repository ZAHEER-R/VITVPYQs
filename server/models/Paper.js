const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    courseCode: { type: String, required: true },
    examYear: { type: String, required: true },
    examName: { type: String, required: true },
    category: { type: String, required: true }, // CAT1, CAT2, FAT
    filePath: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paper', PaperSchema);
