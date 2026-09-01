const API_BASE_URL = '/api';

async function getErrorMessage(response) {
  const error = await response.json().catch(() => null);
  return error?.message || 'Não foi possível concluir a solicitação.';
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

function getUserHeaders(owner) {
  return { 'X-User-Id': owner };
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    headers: getUserHeaders(owner),
    body: formData,
  });

  return response.json();
}

export async function listDocuments(owner) {
  const response = await request('/documents', {
    headers: getUserHeaders(owner),
  });

  return response.json();
}

export async function downloadDocument(id, owner) {
  const response = await request(`/documents/${id}/download`, {
    headers: getUserHeaders(owner),
  });

  return {
    blob: await response.blob(),
    contentDisposition: response.headers.get('content-disposition'),
  };
}