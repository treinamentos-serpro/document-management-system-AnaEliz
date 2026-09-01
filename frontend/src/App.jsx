import { useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';

export default function App() {
  const [owner, setOwner] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_48%,#fefce8_100%)] px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-lg border border-white/80 bg-white/85 p-5 shadow-sm shadow-zinc-200/80 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
                DMS
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
                  Gestão de documentos
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                  Acesse seus PDFs por identificador e acompanhe os envios em um painel direto.
                </p>
              </div>
            </div>

            <div className="w-full max-w-md space-y-2">
              <label className="text-sm font-semibold text-zinc-800" htmlFor="owner">
                Identificador de usuário
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-400"
                id="owner"
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Ex.: ana.eliz"
                type="text"
                value={owner}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <UploadComponent owner={owner} onUpload={() => setRefreshKey((value) => value + 1)} />
          <DocumentList owner={owner} refreshKey={refreshKey} />
        </div>
      </div>
    </main>
  );
}
