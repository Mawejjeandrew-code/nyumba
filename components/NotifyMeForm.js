import { useState } from 'react';
import { createSavedSearch } from '../lib/publicFetch';

export default function NotifyMeForm({ filters, onClose }) {
  const [form, setForm] = useState({ tenant_name: '', tenant_phone: '', tenant_email: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await createSavedSearch({ ...form, filters });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const summary = [
    filters.area || 'Any area',
    filters.bedrooms ? `${filters.bedrooms} BR` : null,
    filters.min_price || filters.max_price
      ? `UGX ${filters.min_price ? Number(filters.min_price).toLocaleString() : '0'}–${filters.max_price ? Number(filters.max_price).toLocaleString() : '∞'}`
      : null,
    filters.amenities?.length ? `${filters.amenities.length} amenities` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="confirmed">
            <i className="ti ti-bell-check" />
            <h3>You're set</h3>
            <p>We'll text and email you the moment a house matching this search goes live.</p>
            <button className="close-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="header">
              <h3>Get notified</h3>
              <button type="button" className="x" onClick={onClose}><i className="ti ti-x" /></button>
            </div>
            <p className="summary">
              <i className="ti ti-filter" /> {summary || 'All listings'}
            </p>

            <input
              placeholder="Your name"
              required
              value={form.tenant_name}
              onChange={(e) => set('tenant_name', e.target.value)}
            />
            <input
              placeholder="Phone — for SMS alerts"
              required
              value={form.tenant_phone}
              onChange={(e) => set('tenant_phone', e.target.value)}
            />
            <input
              placeholder="Email (optional — also alerts you there)"
              type="email"
              value={form.tenant_email}
              onChange={(e) => set('tenant_email', e.target.value)}
            />

            {error && <div className="error">{error}</div>}

            <button type="submit" className="submit" disabled={sending}>
              {sending ? 'Saving…' : 'Notify me'}
            </button>
            <p className="fine-print">
              We'll only message you about matching houses. Unsubscribe anytime from the link in any alert.
            </p>
          </form>
        )}
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(13, 32, 24, 0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 50;
        }
        .sheet {
          background: #f4f2ee;
          border-radius: 18px 18px 0 0;
          padding: 24px;
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .overlay {
            align-items: center;
          }
          .sheet {
            border-radius: 18px;
          }
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        h3 {
          font-size: 19px;
          color: #0d2018;
          margin: 0;
        }
        .x {
          background: none;
          border: none;
          font-size: 18px;
          color: #8a8474;
          cursor: pointer;
        }
        .summary {
          font-size: 13px;
          color: #6b6558;
          background: #fff;
          border: 1px solid #e7e3d9;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 14px 0 16px;
        }
        input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #d8d2c2;
          border-radius: 9px;
          font-size: 14px;
          box-sizing: border-box;
          margin-bottom: 10px;
        }
        .error {
          background: #fbe4e2;
          color: #b3261e;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .submit {
          width: 100%;
          background: #e8a33d;
          color: #29200a;
          border: none;
          padding: 13px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .submit:disabled {
          opacity: 0.6;
        }
        .fine-print {
          font-size: 11px;
          color: #a39c89;
          text-align: center;
          margin: 10px 0 0;
        }
        .confirmed {
          text-align: center;
          padding: 12px 0;
        }
        .confirmed i {
          font-size: 36px;
          color: #1b4332;
        }
        .confirmed h3 {
          margin: 10px 0 6px;
        }
        .confirmed p {
          font-size: 14px;
          color: #6b6558;
          line-height: 1.5;
        }
        .close-btn {
          margin-top: 16px;
          background: #1b4332;
          color: #fff;
          border: none;
          padding: 11px 26px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}