export async function fetchJson(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'Request failed.');
  return body;
}
