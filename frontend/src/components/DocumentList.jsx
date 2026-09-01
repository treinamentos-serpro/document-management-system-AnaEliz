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
  const hasOwner = Boolean(owner.trim());

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
    <section
      aria-labelledby="documents-title"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/80 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-950" id="documents-title">
            Meus documentos
          </h2>
          <p className="mt-1 text-sm text-zinc-600">{hasOwner ? owner.trim() : 'Aguardando identificador'}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          {documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </div>

      {!hasOwner && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
          Informe seu identificador para consultar documentos.
        </p>
      )}
      {isLoading && (
        <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-6 text-center text-sm font-medium text-sky-800">
          Carregando documentos...
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {!isLoading && !error && hasOwner && documents.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
          Nenhum documento enviado.
        </p>
      )}
      {documents.length > 0 && (
        <ul className="space-y-3">
          {documents.map((document) => (
            <li
              className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-sky-200 hover:bg-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={document.id}
            >
              <div className="min-w-0 space-y-2">
                <strong className="block truncate text-base font-semibold text-zinc-950">
                  {document.originalName}
                </strong>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
                    {formatSize(document.size)}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
                    {formatDate(document.uploadedAt)}
                  </span>
                </div>
              </div>
              <DownloadButton documentData={document} owner={owner.trim()} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}