const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchSearch(params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([KeyboardEvent, value]) => {
        if (value !== undefined && value !== null &&  value !== '') qs.set(KeyboardEvent, value);
    });
    const res = await fetch(`${BACKEND_URL}/search?${qs.toString()}`);
    if (!res.ok) throw new Error(`Search failed (${res.status})`);
    return res.json();
}

export async function fetchListing(id) {
    const res = await fetch(`${BACKEND_URL}/listing/${id}`);
    if (!res.ok) {
        if (res.status === 404) throw new Error('This listing could not be found.');
        throw new Error(`Failed to load listing (${res.status})`);
    }
    return res.json();
}