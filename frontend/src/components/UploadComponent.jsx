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
    <section
      aria-labelledby="upload-title"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/80 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-950" id="upload-title">
            Enviar documento
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600">Selecione um PDF para registrar no seu usuário.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          PDF
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-800" htmlFor="document-file">
            Arquivo PDF
          </label>
          <input
            accept="application/pdf"
            className="block w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-700 transition file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-sky-300 hover:bg-sky-50/60"
            id="document-file"
            name="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
            type="file"
          />
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}