const URL = import.meta.env.VITE_API_URL;

export async function list(sheet) {
  const res = await fetch(`${URL}?sheet=${sheet}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

// Content-Type text/plain supaya tidak kena preflight CORS di Apps Script
export async function send(action, sheet, data, password) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, sheet, data, password }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}