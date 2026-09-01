import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

function getDownloadName(contentDisposition, fallbackName) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallbackName;
}

export default function DownloadButton({ documentData, owner }) {
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setError('');
    setIsDownloading(true);

    try {
      const { blob, contentDisposition } = await downloadDocument(documentData.id, owner);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = getDownloadName(contentDisposition, documentData.originalName);
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-2 sm:text-right">
      <button
        className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 sm:w-auto"
        disabled={isDownloading}
        onClick={handleDownload}
        type="button"
      >
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && (
        <p className="text-left text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}