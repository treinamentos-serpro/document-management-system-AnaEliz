const fs = require('node:fs');
const { DocumentsServiceError } = require('../services/documents.service');

function getOwner(request) {
  const owner = request.get('X-User-Id')?.trim();

  if (!owner) {
    throw new DocumentsServiceError(400, 'MISSING_USER_ID', 'O header X-User-Id é obrigatório.');
  }

  return owner;
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function createDocumentsController(documentsService) {
  return {
    requireOwner(request, response, next) {
      try {
        request.owner = getOwner(request);
        return next();
      } catch (error) {
        return next(error);
      }
    },

    upload(request, response, next) {
      try {
        const owner = request.owner || getOwner(request);
        const document = documentsService.createDocument(request.file, owner);
        return response.status(201).json(toPublicDocument(document));
      } catch (error) {
        return next(error);
      }
    },

    list(request, response, next) {
      try {
        const owner = request.owner || getOwner(request);
        const documents = documentsService.listDocuments(owner).map(toPublicDocument);
        return response.json(documents);
      } catch (error) {
        return next(error);
      }
    },

    download(request, response, next) {
      try {
        const owner = request.owner || getOwner(request);
        const { document, filePath } = documentsService.getDocumentForDownload(request.params.id, owner);

        response.set({
          'Content-Type': 'application/pdf',
          'Content-Length': document.size,
          'Content-Disposition': `attachment; filename="${document.originalName.replace(/["\\\r\n]/g, '_')}"`,
        });

        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', next);
        return fileStream.pipe(response);
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = createDocumentsController;