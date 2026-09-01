import { useEffect, useState } from 'react';
import { listDocuments } from '../services/documentsApi';
import DownloadButton from './DownloadButton';

function formatSize(size) {
  return `${(size / 1024).toFixed(1)} KB`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ owner, refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!owner.trim()) {
      setDocuments([]);
      setError('');
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError('');

    async function loadDocuments() {
      try {
        const result = await listDocuments(owner.trim());
        if (isActive) {
          setDocuments(result);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isActive = false;
    };
  }, [owner, refreshKey]);

  return (
    <section aria-labelledby="documents-title">
      <h2 id="documents-title">Meus documentos</h2>
      {!owner.trim() && <p>Informe seu identificador para consultar documentos.</p>}
      {isLoading && <p>Carregando documentos...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && owner.trim() && documents.length === 0 && (
        <p>Nenhum documento enviado.</p>
      )}
      {documents.length > 0 && (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <strong>{document.originalName}</strong>
              <span>{formatSize(document.size)}</span>
              <span>{formatDate(document.uploadedAt)}</span>
              <DownloadButton documentData={document} owner={owner.trim()} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}