const fs = require('node:fs');
const path = require('node:path');

class DocumentsRepository {
  constructor(storageDir) {
    this.storageDir = path.resolve(storageDir);
    this.documents = new Map();
    fs.mkdirSync(this.storageDir, { recursive: true });
  }

  save(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findById(id) {
    return this.documents.get(id) || null;
  }

  findByOwner(owner) {
    return [...this.documents.values()]
      .filter((document) => document.owner === owner)
      .sort((firstDocument, secondDocument) => (
        new Date(secondDocument.uploadedAt) - new Date(firstDocument.uploadedAt)
      ));
  }

  removeFile(storedName) {
    const filePath = this.getFilePath(storedName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFilePath(storedName) {
    const filePath = path.resolve(this.storageDir, storedName);
    const storagePathPrefix = `${this.storageDir}${path.sep}`;

    if (!filePath.startsWith(storagePathPrefix)) {
      throw new Error('Nome de arquivo armazenado inválido.');
    }

    return filePath;
  }
}

module.exports = DocumentsRepository;