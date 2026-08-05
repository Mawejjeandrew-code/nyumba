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

// Field names here match your real backend's SavedSearchRequest —
// min_price_ugx / max_price_ugx / required_amenities, not the
// min_price / max_price / amenities used in an earlier draft of this
// function. Double-check these against app/main.py if they ever move again.
export async function createSavedSearch({ tenant_name, tenant_phone, tenant_email, filters }) {
  const res = await fetch(`${BACKEND_URL}/saved-searches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_name,
      tenant_phone,
      tenant_email: tenant_email || undefined,
      area: filters.area || undefined,
      min_price_ugx: filters.min_price ? Number(filters.min_price) : undefined,
      max_price_ugx: filters.max_price ? Number(filters.max_price) : undefined,
      bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
      required_amenities: filters.amenities || [],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Could not save your search.');
  return data;
}

export async function unsubscribeSavedSearch(token) {
  const res = await fetch(`${BACKEND_URL}/saved-searches/unsubscribe/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'This link is invalid.');
  return data;
}