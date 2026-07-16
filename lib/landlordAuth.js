import { supabase } from './supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function persistSession(session) {
    if (!session?.access_token || !session?.refresh_token) return;
    await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,

    });

}

export async function signupLandlord({phone, password, name, email }) {
    const res = await fetch(`${BACKEND_URL}/auth/landlord/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name, email }),

    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Signup failed');
    await persistSession(data.session);
    return data;

}

export async function loginLandlord({ phone, password}) {
    const res = await fetch (`${BACKEND_URL}/auth/landlord/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.error || 'Login failed');
    await persistSession(data.session);
    return data;

}

export async function getLandlordToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session.access_token || null;


}
    
export async function getLandlordUserId() {
    const { data } = await supabase.getUser();
    return data ?.user?.id || null  

}
export async function logoutLandlord() {
    await supabase .auth.signOut();                                                                                                                                                            jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
}