const crypto = require('node:crypto');
const fs = require('node:fs');

class DocumentsServiceError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class DocumentsService {
  constructor(documentsRepository) {
    this.documentsRepository = documentsRepository;
  }

  createDocument(file, owner) {
    if (!file) {
      throw new DocumentsServiceError(400, 'MISSING_FILE', 'O arquivo é obrigatório.');
    }

    if (file.mimetype !== 'application/pdf') {
      this.documentsRepository.removeFile(file.filename);
      throw new DocumentsServiceError(400, 'INVALID_FILE_TYPE', 'Envie um arquivo PDF.');
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
    };

    try {
      return this.documentsRepository.save(document);
    } catch (error) {
      this.documentsRepository.removeFile(file.filename);
      throw error;
    }
  }

  listDocuments(owner) {
    return this.documentsRepository.findByOwner(owner);
  }

  getDocumentForDownload(id, owner) {
    const document = this.documentsRepository.findById(id);

    if (!document || document.owner !== owner) {
      throw new DocumentsServiceError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    const filePath = this.documentsRepository.getFilePath(document.storedName);

    if (!fs.existsSync(filePath)) {
      throw new DocumentsServiceError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    return { document, filePath };
  }
}

module.exports = { DocumentsService, DocumentsServiceError };