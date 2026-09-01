const { test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const app = require('../src/app');

async function withServer(testFn) {
  const server = app.listen(0);
  await once(server, 'listening');

  try {
    await testFn(server.address().port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

test('deve permitir upload, listagem e download de um documento', async () => {
  await withServer(async (port) => {
    const formData = new FormData();
    const fileContent = 'conteúdo do arquivo de teste';

    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'demo.txt');
    formData.append('owner', 'ana');

    const uploadResponse = await fetch(`http://127.0.0.1:${port}/upload`, {
      method: 'POST',
      body: formData
    });

    assert.strictEqual(uploadResponse.status, 201, 'upload deve retornar status 201');

    const uploaded = await uploadResponse.json();
    assert.strictEqual(uploaded.originalName, 'demo.txt');
    assert.strictEqual(uploaded.owner, 'ana');
    assert.ok(uploaded.id, 'deve retornar um id do documento');

    const listResponse = await fetch(`http://127.0.0.1:${port}/documents`);
    assert.strictEqual(listResponse.status, 200, 'listagem deve retornar status 200');

    const documents = await listResponse.json();
    assert.ok(Array.isArray(documents));
    assert.ok(documents.some((document) => document.id === uploaded.id));

    const downloadResponse = await fetch(`http://127.0.0.1:${port}/documents/${uploaded.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'download deve retornar status 200');

    const downloadedContent = await downloadResponse.text();
    assert.strictEqual(downloadedContent, fileContent);
  });
});

test('deve rejeitar upload sem arquivo', async () => {
  await withServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner: 'ana' })
    });

    assert.strictEqual(response.status, 400);
    const payload = await response.json();
    assert.match(payload.error, /Arquivo/i);
  });
});
