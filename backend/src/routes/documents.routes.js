const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const DocumentsRepository = require('../repositories/documents.repository');
const { DocumentsService } = require('../services/documents.service');
const createDocumentsController = require('../controllers/documents.controller');

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function readMaxFileSize() {
  const value = process.env.MAX_FILE_SIZE_BYTES;

  if (!value) {
    return DEFAULT_MAX_FILE_SIZE_BYTES;
  }

  const maxFileSize = Number(value);

  if (!Number.isInteger(maxFileSize) || maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
  }

  return maxFileSize;
}

function createDocumentsRouter() {
  const storageDir = path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '../../storage'));
  fs.mkdirSync(storageDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDir,
      filename: (request, file, callback) => callback(null, crypto.randomUUID()),
    }),
    limits: { fileSize: readMaxFileSize() },
  });
  const repository = new DocumentsRepository(storageDir);
  const service = new DocumentsService(repository);
  const controller = createDocumentsController(service);
  const router = express.Router();

  router.post('/upload', controller.requireOwner, upload.single('file'), controller.upload);
  router.get('/documents', controller.requireOwner, controller.list);
  router.get('/documents/:id/download', controller.requireOwner, controller.download);

  return router;
}

module.exports = createDocumentsRouter;