const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

class DocumentRepository {
  constructor(storageDir = path.resolve(__dirname, '../../storage')) {
    this.storageDir = storageDir;
    this.documents = new Map();
    this.ensureStorageDir();
  }

  ensureStorageDir() {
    fs.mkdirSync(this.storageDir, { recursive: true });
  }

  createDocument(file, owner = 'anonymous') {
    if (!file || !file.originalname || !file.path) {
      throw new Error('Arquivo inválido para persistência.');
    }

    const id = this.generateId();
    const document = {
      id,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      path: file.path,
      storedName: file.filename
    };

    this.documents.set(id, document);

    return this.toPublicDocument(document);
  }

  generateId() {
    return crypto.randomUUID();
  }

  listDocuments() {
    return Array.from(this.documents.values())
      .filter((document) => document && document.id)
      .map((document) => this.toPublicDocument(document));
  }

  findDocumentById(id) {
    const document = this.documents.get(id);
    return document ? this.toPublicDocument(document) : null;
  }

  getDocumentFile(id) {
    const document = this.documents.get(id);

    if (!document) {
      return null;
    }

    return {
      ...this.toPublicDocument(document),
      filePath: document.path
    };
  }

  toPublicDocument(document) {
    return {
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      uploadedAt: document.uploadedAt,
      owner: document.owner
    };
  }
}

module.exports = DocumentRepository;
