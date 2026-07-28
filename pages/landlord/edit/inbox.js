import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLandlordToken } from '../../lib/landlordAuth';
import { landlordFetch } from '../../lib/landlordFetch';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function whatsappLink(phone, message) {
  const clean = (phone || '').replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default function LandlordInbox() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(null);
  const [unreplied, setUnreplied] = useState(0);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
    landlordFetch('/landlord/inquiries')
      .then((d) => {
        setInquiries(d.inquiries);
        setUnreplied(d.unreplied);
      })
      .catch((e) => setError(e.message));
  }

  async function handleReply(inquiryId) {
    const message = (drafts[inquiryId] || '').trim();
    if (!message) return;
    setSendingId(inquiryId);
    try {
      await landlordFetch(`/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        body: { reply_message: message },
      });
      setDrafts((d) => ({ ...d, [inquiryId]: '' }));
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingId(null);
    }
  }

  if (checkingAuth) {
    return <div className="loading">Checking your session…<style jsx>{sharedStyles}</style></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/landlord/dashboard" className="back"><i className="ti ti-arrow-left" /> Dashboard</Link>
        <div className="brand"><span className="dot" /> Nyumba</div>
      </header>

      <main>
        <div className="header-row">
          <h1>Inbox</h1>
          {unreplied > 0 && <span className="unreplied-badge">{unreplied} awaiting reply</span>}
        </div>

        {error && <div className="error">{error}</div>}
        {!inquiries && !error && <div className="empty">Loading…</div>}
        {inquiries && inquiries.length === 0 && (
          <div className="empty">
            <p>No messages yet — they'll show up here the moment a tenant asks about one of your listings.</p>
          </div>
        )}

        <div className="list">
          {inquiries?.map((inq) => {
            const isReplied = !!inq.replied_at;
            const draft = drafts[inq.id] || '';
            return (
              <div key={inq.id} className={`row ${isReplied ? '' : 'unreplied'}`}>
                <div className="row-top">
                  <div>
                    <span className="tenant-name">{inq.tenant_name}</span>
                    <span className="listing-tag">{inq.listings?.title || 'Listing'}</span>
                  </div>
                  <span className="time">{timeAgo(inq.created_at)}</span>
                </div>

                <p className="message">{inq.message}</p>

                {isReplied ? (
                  <div className="reply-sent">
                    <i className="ti ti-corner-down-right" /> You replied: "{inq.reply_message}"
                  </div>
                ) : (
                  <div className="reply-box">
                    <textarea
                      rows={2}
                      placeholder="Type a reply — sent to them by SMS…"
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [inq.id]: e.target.value }))}
                    />
                    <div className="reply-actions">
                      <button
                        className="btn primary"
                        disabled={!draft.trim() || sendingId === inq.id}
                        onClick={() => handleReply(inq.id)}
                      >
                        {sendingId === inq.id ? 'Sending…' : 'Reply by SMS'}
                      </button>
                      <a className="btn" href={`tel:${inq.tenant_phone}`}>
                        <i className="ti ti-phone" /> Call
                      </a>
                      <a
                        className="btn"
                        href={whatsappLink(inq.tenant_phone, `Hi ${inq.tenant_name}, `)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="ti ti-brand-whatsapp" /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <style jsx>{sharedStyles}</style>
    </div>
  );
}

const sharedStyles = `
  .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f4f2ee; color: #8a8474; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  .page { min-height: 100vh; background: #f4f2ee; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  .topbar { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
  .back { color: #6b6558; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 4px; }
  .brand { display: flex; align-items: center; gap: 6px; color: #0d2018; font-weight: 700; font-size: 14px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #3ba26a; }
  main { max-width: 640px; margin: 0 auto; padding: 8px 24px 80px; }
  .header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  h1 { font-size: 22px; color: #0d2018; margin: 0; }
  .unreplied-badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 100px; background: #fbe4e2; color: #b3261e; }
  .error { background: #fbe4e2; color: #b3261e; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
  .empty { text-align: center; padding: 60px 24px; color: #8a8474; }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .row { background: #fff; border: 1px solid #e7e3d9; border-radius: 12px; padding: 16px; }
  .row.unreplied { border-color: #e8a33d; box-shadow: 0 0 0 1px #e8a33d inset; }
  .row-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .tenant-name { font-weight: 700; color: #0d2018; font-size: 14px; }
  .listing-tag { font-size: 12px; color: #8a8474; margin-left: 8px; }
  .time { font-size: 12px; color: #b8ae95; }
  .message { font-size: 14px; color: #29200a; margin: 0 0 4px; line-height: 1.5; }
  .reply-sent { font-size: 13px; color: #1b4332; background: #e3efe6; padding: 8px 10px; border-radius: 7px; margin-top: 8px; display: flex; align-items: flex-start; gap: 6px; }
  .reply-box { margin-top: 10px; }
  .reply-box textarea {
    width: 100%; padding: 9px 12px; border: 1px solid #d8d2c2; border-radius: 8px;
    font-size: 13px; box-sizing: border-box; font-family: inherit; resize: vertical;
  }
  .reply-actions { display: flex; gap: 8px; margin-top: 8px; }
  .btn {
    font-size: 12px; font-weight: 600; padding: 8px 12px; border-radius: 7px; border: none;
    background: #eee9de; color: #0d2018; text-decoration: none; cursor: pointer;
    display: flex; align-items: center; gap: 5px;
  }
  .btn.primary { background: #1b4332; color: #fff; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;