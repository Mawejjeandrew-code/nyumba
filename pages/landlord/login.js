import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { loginLandlord, signupLandlord } from '../../lib/landlordAuth';

export default function LandlordLogin() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ phone: '', password: '', name: '', email: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await loginLandlord({ phone: form.phone, password: form.password });
      } else {
        await signupLandlord(form);
      }
      router.push('/landlord/list-property');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <Link href="/" className="brand">
          <span className="dot" /> Nyumba
        </Link>
        <h1>{mode === 'login' ? 'Welcome back' : 'List your house, free'}</h1>
        <p className="sub">
          {mode === 'login'
            ? 'Log in to manage your listings.'
            : 'No broker fees. Keep 100% of your rent.'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <input
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
              <input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </>
          )}
          <input
            placeholder="Phone — e.g. 0701234567"
            required
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <button className="toggle" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? "New landlord? Sign up free" : 'Already have an account? Log in'}
        </button>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0d2018;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .card {
          background: #f4f2ee;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 380px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0d2018;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3ba26a;
        }
        h1 {
          font-size: 22px;
          margin: 20px 0 4px;
          color: #0d2018;
        }
        .sub {
          font-size: 14px;
          color: #8a8474;
          margin-bottom: 20px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        input {
          padding: 11px 14px;
          border: 1px solid #d8d2c2;
          border-radius: 9px;
          font-size: 14px;
        }
        button[type='submit'] {
          background: #1b4332;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
        }
        button[type='submit']:disabled {
          opacity: 0.6;
        }
        .error {
          background: #fbe4e2;
          color: #b3261e;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }
        .toggle {
          background: none;
          border: none;
          color: #1b4332;
          font-size: 13px;
          margin-top: 16px;
          cursor: pointer;
          text-decoration: underline;
          width: 100%;
        }
      `}</style>
    </div>
  );
}