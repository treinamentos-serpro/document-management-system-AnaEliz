import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ owner, onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!owner.trim()) {
      setError('Informe seu identificador de usuário antes de enviar um documento.');
      return;
    }

    if (!file) {
      setError('Selecione um arquivo PDF para enviar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const document = await uploadDocument(file, owner.trim());
      setFile(null);
      event.target.reset();
      onUpload(document);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="upload-title">
      <h2 id="upload-title">Enviar documento</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="document-file">Arquivo PDF</label>
        <input
          accept="application/pdf"
          id="document-file"
          name="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          required
          type="file"
        />
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}