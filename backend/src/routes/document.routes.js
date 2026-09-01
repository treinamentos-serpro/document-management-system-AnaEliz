const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const DocumentService = require('../services/document.service');
const DocumentController = require('../controllers/document.controller');

const router = express.Router();
const documentService = new DocumentService();
const documentController = new DocumentController(documentService);

const storageDir = path.resolve(__dirname, '../../storage');
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, storageDir);
  },
  filename: (_req, file, callback) => {
    const safeName = path.basename(file.originalname || 'document')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'document';

    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    callback(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({ storage });
const uploadRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: 'Muitas requisições de upload. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/upload', uploadRateLimiter, upload.single('file'), (req, res) => documentController.upload(req, res));
router.get('/documents', (req, res) => documentController.list(req, res));
router.get('/documents/:id/download', (req, res) => documentController.download(req, res));

module.exports = router;
