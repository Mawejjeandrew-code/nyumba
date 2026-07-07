export async  function adminFetch(path, { method = 'GET', BODY } = {}) {
    const res = await fetch('/api/admin/proxy', {
        method: 'POST', // the proxy route itself is always POST; it carries the real method inside
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, method, body }),

    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || data.detail || `Request failed (${res.status})`)
    }
    return data;
}