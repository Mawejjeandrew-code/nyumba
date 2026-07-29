const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchSearch(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  });

  const res = await fetch(`${BACKEND_URL}/search?${qs.toString()}`);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  return res.json();
}

export async function fetchListing(id) {
  const res = await fetch(`${BACKEND_URL}/listings/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('This listing could not be found.');
    throw new Error(`Failed to load listing (${res.status})`);
  }
  return res.json();
}

export async function submitInquiry(listingId, { tenant_name, tenant_phone, message }) {
  const res = await fetch(`${BACKEND_URL}/listings/${listingId}/inquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_name, tenant_phone, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Could not send your message.');
  return data;
}