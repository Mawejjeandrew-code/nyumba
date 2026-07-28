import { useState } from 'react';
import { submitInquiry } from '../lib/publicFetch';

export default function InquiryForm({ listingId }) {
  const [form, setForm] = useState({ tenant_name: '', tenant_phone: '', message: '' });
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
      await submitInquiry(listingId, form);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="sent">
        <i className="ti ti-circle-check" /> Sent — the landlord will reply by SMS.
        <style jsx>{`
          .sent {
            margin-top: 14px;
            padding: 12px 14px;
            background: #e3efe6;
            color: #1b4332;
            border-radius: 9px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="inquiry-form">
      <div className="divider">or ask a question through Nyumba</div>
      <input
        placeholder="Your name"
        required
        value={form.tenant_name}
        onChange={(e) => set('tenant_name', e.target.value)}
      />
      <input
        placeholder="Your phone"
        required
        value={form.tenant_phone}
        onChange={(e) => set('tenant_phone', e.target.value)}
      />
      <textarea
        rows={3}
        placeholder="Is this still available? Any question you have…"
        required
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={sending}>
        {sending ? 'Sending…' : 'Send message'}
      </button>

      <style jsx>{`
        .inquiry-form {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #f0ede4;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .divider {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #a39c89;
          margin-bottom: 4px;
        }
        input,
        textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #d8d2c2;
          border-radius: 8px;
          font-size: 13px;
          box-sizing: border-box;
          font-family: inherit;
        }
        .error {
          background: #fbe4e2;
          color: #b3261e;
          padding: 8px 10px;
          border-radius: 7px;
          font-size: 12px;
        }
        button {
          background: #0d2018;
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
        }
      `}</style>
    </form>
  );
}