const fs = require('node:fs');
const DocumentRepository = require('../repositories/document.repository');

class DocumentService {
  constructor(repository = new DocumentRepository()) {
    this.repository = repository;
  }

  uploadDocument(file, owner = 'anonymous') {
    this.validateUpload(file);

    return this.repository.createDocument(file, owner);
  }

  listDocuments() {
    return this.repository.listDocuments();
  }

  downloadDocument(id) {
    const document = this.repository.getDocumentFile(id);

    if (!document) {
      throw this.createError('Documento não encontrado.', 404);
    }

    if (!fs.existsSync(document.filePath)) {
      throw this.createError('Arquivo do documento não foi encontrado no armazenamento local.', 404);
    }

    return document;
  }

  validateUpload(file) {
    if (!file) {
      throw this.createError('Arquivo obrigatório.', 400);
    }

    if (!file.originalname || !file.path) {
      throw this.createError('Arquivo inválido.', 400);
    }
  }

  createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
}

module.exports = DocumentService;
