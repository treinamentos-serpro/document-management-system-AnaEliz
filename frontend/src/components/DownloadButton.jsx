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
    <>
      <button disabled={isDownloading} onClick={handleDownload} type="button">
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}