import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { unsubscribeSavedSearch } from '../../../lib/publicFetch';

export default function Unsubscribe() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('pending'); // 'pending' | 'done' | 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    unsubscribeSavedSearch(token)
      .then(() => setStatus('done'))
      .catch((e) => {
        setError(e.message);
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="page">
      <div className="card">
        <Link href="/" className="brand"><span className="dot" /> Nyumba</Link>

        {status === 'pending' && <p className="msg">Unsubscribing…</p>}

        {status === 'done' && (
          <>
            <i className="ti ti-circle-check icon" />
            <h1>You're unsubscribed</h1>
            <p className="msg">You won't get any more alerts for this saved search.</p>
            <Link href="/search" className="cta">Back to search</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <i className="ti ti-alert-triangle icon error" />
            <h1>Couldn't unsubscribe</h1>
            <p className="msg">{error}</p>
            <Link href="/search" className="cta">Back to search</Link>
          </>
        )}
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
          padding: 36px 32px;
          width: 100%;
          max-width: 380px;
          text-align: center;
        }
        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
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
        .icon {
          font-size: 40px;
          color: #1b4332;
          margin-top: 20px;
        }
        .icon.error {
          color: #b3261e;
        }
        h1 {
          font-size: 20px;
          color: #0d2018;
          margin: 12px 0 6px;
        }
        .msg {
          font-size: 14px;
          color: #6b6558;
          margin: 20px 0 0;
        }
        .cta {
          display: inline-block;
          margin-top: 20px;
          background: #1b4332;
          color: #fff;
          padding: 11px 24px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}