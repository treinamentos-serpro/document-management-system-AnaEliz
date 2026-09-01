import { useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';

export default function App() {
  const [owner, setOwner] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main>
      <h1>Document Management System</h1>
      <label htmlFor="owner">Identificador de usuário</label>
      <input
        id="owner"
        onChange={(event) => setOwner(event.target.value)}
        placeholder="Ex.: ana.eliz"
        type="text"
        value={owner}
      />
      <UploadComponent owner={owner} onUpload={() => setRefreshKey((value) => value + 1)} />
      <DocumentList owner={owner} refreshKey={refreshKey} />
    </main>
  );
}
