const { after, before, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDir;
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(storageDir, { recursive: true, force: true });
});

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('permite enviar, listar e baixar apenas documentos do proprietário', async () => {
  const formData = new FormData();
  const content = 'conteúdo do PDF de teste';
  formData.append('file', new Blob([content], { type: 'application/pdf' }), 'relatorio.pdf');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'ana' },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'relatorio.pdf');
  assert.strictEqual(document.owner, 'ana');

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const unauthorizedDownload = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'outro-usuario' },
  });

  assert.strictEqual(unauthorizedDownload.status, 404);
  assert.strictEqual((await unauthorizedDownload.json()).error, 'DOCUMENT_NOT_FOUND');

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'ana' },
  });

  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(downloadResponse.headers.get('content-type'), 'application/pdf');
  assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.pdf/);
  assert.strictEqual(await downloadResponse.text(), content);
});
