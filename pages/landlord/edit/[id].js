import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLandlordToken, logoutLandlord } from '../../lib/landlordAuth';
import { landlordFetch } from '../../lib/landlordFetch';

const STATUS_TONE = {
  pending: { bg: '#fdf1dd', fg: '#b8720c', label: 'Pending' },
  in_review: { bg: '#fdf1dd', fg: '#b8720c', label: 'In review' },
  needs_info: { bg: '#fde8d6', fg: '#c15b1c', label: 'Needs info' },
  verified: { bg: '#e3efe6', fg: '#1b4332', label: 'Verified' },
  rejected: { bg: '#fbe4e2', fg: '#b3261e', label: 'Rejected' },
};

export default function LandlordDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState(null);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [resubmitting, setResubmitting] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await getLandlordToken();
      if (!token) {
        router.replace('/landlord/login');
        return;
      }
      setCheckingAuth(false);
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load() {
    landlordFetch('/landlord/listings')
      .then((d) => setListings(d.listings))
      .catch((e) => setError(e.message));
  }

  async function handleResubmit(listingId) {
    setResubmitting(listingId);
    try {
      await landlordFetch('/listings/resubmit', { method: 'POST', body: { listing_id: listingId } });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setResubmitting(null);
    }
  }

  if (checkingAuth) {
    return <div className="loading">Checking your session…<style jsx>{sharedStyles}</style></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/" className="brand"><span className="dot" /> Nyumba</Link>
        <div className="topbar-actions">
          <Link href="/landlord/list-property" className="new-listing">+ New listing</Link>
          <button className="logout" onClick={async () => { await logoutLandlord(); router.push('/landlord/login'); }}>
            Log out
          </button>
        </div>
      </header>

      <main>
        <h1>Your listings</h1>

        {error && <div className="error">{error}</div>}
        {!listings && !error && <div className="empty">Loading…</div>}
        {listings && listings.length === 0 && (
          <div className="empty">
            <p>You haven't listed a property yet.</p>
            <Link href="/landlord/list-property" className="cta">List your first house — free</Link>
          </div>
        )}

        {listings && listings.length > 0 && (
          <div className="list">
            {listings.map((l) => {
              const tone = STATUS_TONE[l.verification_status] || STATUS_TONE.pending;
              const canResubmit = l.verification_status === 'rejected';
              const canEdit = l.verification_status !== 'rejected';
              return (
                <div key={l.id} className="row">
                  <div className="photo">
                    {l.photo_urls?.[0] ? (
                      <img src={l.photo_urls[0]} alt="" />
                    ) : (
                      <div className="placeholder"><i className="ti ti-home" /></div>
                    )}
                  </div>

                  <div className="info">
                    <div className="title">{l.title || 'Untitled listing'}</div>
                    <div className="sub">
                      {l.area} · {l.bedrooms} BR · UGX {Number(l.price_ugx).toLocaleString()}/mo
                    </div>
                    {l.fraud_score >= 40 && (
                      <div className="fraud-warning">
                        <i className="ti ti-alert-triangle" /> Flagged for review — score {Math.round(l.fraud_score)}
                      </div>
                    )}
                  </div>

                  <div className="status" style={{ background: tone.bg, color: tone.fg }}>
                    {tone.label}
                  </div>

                  <div className="actions">
                    {canEdit && (
                      <Link href={`/landlord/edit/${l.id}`} className="btn">Edit</Link>
                    )}
                    {canResubmit && (
                      <button
                        className="btn amber"
                        disabled={resubmitting === l.id}
                        onClick={() => handleResubmit(l.id)}
                      >
                        {resubmitting === l.id ? 'Resubmitting…' : 'Fix & resubmit'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style jsx>{sharedStyles}</style>
    </div>
  );
}

const sharedStyles = `
  .loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f4f2ee; color: #8a8474; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .page { min-height: 100vh; background: #f4f2ee; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  .topbar {
    background: #0d2018; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 8px; color: #f4f2ee; font-weight: 700; font-size: 17px; text-decoration: none; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #3ba26a; }
  .topbar-actions { display: flex; align-items: center; gap: 14px; }
  .new-listing {
    background: #e8a33d; color: #29200a; padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 600; text-decoration: none;
  }
  .logout { background: none; border: none; color: rgba(244,242,238,0.6); font-size: 13px; cursor: pointer; }
  main { max-width: 900px; margin: 0 auto; padding: 32px 24px 80px; }
  h1 { font-size: 22px; color: #0d2018; margin: 0 0 20px; }
  .error { background: #fbe4e2; color: #b3261e; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
  .empty { text-align: center; padding: 60px 24px; color: #8a8474; }
  .empty .cta {
    display: inline-block; margin-top: 14px; background: #1b4332; color: #fff;
    padding: 11px 22px; border-radius: 9px; text-decoration: none; font-size: 14px; font-weight: 600;
  }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .row {
    background: #fff; border: 1px solid #e7e3d9; border-radius: 12px; padding: 14px;
    display: flex; align-items: center; gap: 14px;
  }
  .photo { width: 64px; height: 64px; border-radius: 9px; overflow: hidden; background: #eee9de; flex-shrink: 0; }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #b8ae95; font-size: 20px; }
  .info { flex: 1; min-width: 0; }
  .title { font-weight: 600; color: #0d2018; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sub { font-size: 13px; color: #8a8474; margin-top: 3px; }
  .fraud-warning { font-size: 12px; color: #b3261e; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
  .status { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 100px; white-space: nowrap; }
  .actions { display: flex; gap: 8px; flex-shrink: 0; }
  .btn {
    font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 7px; border: none;
    background: #eee9de; color: #0d2018; text-decoration: none; cursor: pointer;
  }
  .btn.amber { background: #e8a33d; color: #29200a; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;