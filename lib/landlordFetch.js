import { getLandlordToken } from './landlordAuth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function landlordFetch(path, { method = 'GET', body } = {}) {
    const token = await getLandlordToken();
    if (!token) throw new Error('Your session expired - please log in again.');

    const res = await fetch(`${BACKEND_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: method === 'GET' ? undefined : JSON.stringify(body || {}),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || `Request failed (${res.status})`);
    return data;

}