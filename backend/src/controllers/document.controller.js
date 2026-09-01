class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload(req, res) {
    try {
      const owner = req.body && req.body.owner ? req.body.owner : 'anonymous';
      const document = this.documentService.uploadDocument(req.file, owner);

      return res.status(201).json(document);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  list(req, res) {
    try {
      const documents = this.documentService.listDocuments();
      return res.status(200).json(documents);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  download(req, res) {
    try {
      const document = this.documentService.downloadDocument(req.params.id);
      return res.download(document.filePath, document.originalName);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  handleError(res, error) {
    const statusCode = error && error.statusCode ? error.statusCode : 500;
    const message = error && error.message ? error.message : 'Erro interno do servidor.';

    return res.status(statusCode).json({ error: message });
  }
}

module.exports = DocumentController;
