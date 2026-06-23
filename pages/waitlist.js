

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';

const AREAS = [
  'Ntinda', 'Kisaasi', 'Naguru', 'Naalya', 'Najjera',
  'Mutungo', 'Bugolobi', 'Kololo', 'Muyenga', 'Kira',
  'Namugongo', 'Bweyogerere', 'Kyaliwajjala', 'Seguku',
  'Entebbe Road', 'Other',
];

export default function WaitlistPage() {
  const [step, setStep]         = useState('form'); // 'form' | 'success'
  const [role, setRole]         = useState(null);
  const [form, setForm]         = useState({ firstName: '', lastName: '', phone: '', area: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [stats, setStats]       = useState({ total: 0, tenants: 0, landlords: 0 });
  const [confirmation, setConf] = useState(null);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    const { data } = await supabase.from('waitlist_stats').select('*').single();
    if (data) setStats(data);
  }

  function validate() {
    const e = {};
    if (!role)              e.role      = 'Please choose tenant or landlord.';
    if (!form.firstName)    e.firstName = 'Required';
    if (!form.lastName)     e.lastName  = 'Required';
    if (!form.phone || form.phone.replace(/\s/g, '').length < 10)
                            e.phone     = 'Enter a valid Uganda number (+256...)';
    if (!form.area)         e.area      = 'Please select your area.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, role }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setErrors({ phone: `Already on the list at position #${data.position}` });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setErrors({ submit: data.error || 'Something went wrong. Try again.' });
        setLoading(false);
        return;
      }

      setConf(data);
      setStep('success');
      loadStats();

    } catch (err) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const shareText = `I just joined the Nyumba waiting list — the first house rental platform in Uganda with ZERO broker fees. Join here:`;
  const shareUrl  = `https://nyumba.ug/waitlist${confirmation?.referralCode ? `?ref=${confirmation.referralCode}` : ''}`;

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <>
      <Head>
        <title>Nyumba — Join the waiting list | No broker. Just home.</title>
        <meta name="description" content="The first direct landlord-to-tenant rental platform in Uganda. Zero broker fees. Find a house, contact the landlord, move in." />
        <meta name="theme-color" content="#1b3d2c" />
      </Head>

      <main style={styles.main}>
        {step === 'form' && (
          <>
            {/* HERO */}
            <div style={styles.hero}>
              <div style={styles.logoBox}>
                <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
                  <path d="M10 26L26 12L42 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="15" y="26" width="22" height="16" rx="2" fill="white"/>
                  <rect x="22" y="32" width="8" height="10" rx="1" fill="#1b3d2c"/>
                  <circle cx="38" cy="18" r="5" fill="#7dc9a0"/>
                </svg>
              </div>
              <p style={styles.heroKicker}>Coming to Uganda</p>
              <h1 style={styles.heroH1}>No broker.<br/>Just home.</h1>
              <p style={styles.heroPara}>
                The first direct landlord-to-tenant platform in Uganda.
                Find a house, call the landlord, move in. Zero commission. Forever.
              </p>
              <div style={styles.tagRow}>
                {['Verified listings', 'Zero broker fee', 'Kampala first'].map(t => (
                  <span key={t} style={styles.tag}>{t}</span>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div style={styles.statsRow}>
              {[
                { n: stats.total,     l: 'On the list' },
                { n: stats.tenants,   l: 'Tenants'     },
                { n: stats.landlords, l: 'Landlords'   },
              ].map(s => (
                <div key={s.l} style={styles.statCard}>
                  <div style={styles.statNum}>{s.n}</div>
                  <div style={styles.statLbl}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* FORM */}
            <div style={styles.card}>
              <h2 style={styles.cardH2}>Join the waiting list</h2>
              <p style={styles.cardPara}>
                Be first when we launch in Kampala. Early members get priority access
                and lifetime zero-commission guarantee.
              </p>

              {/* ROLE */}
              <div style={styles.roleGrid}>
                {[
                  { key: 'tenant',   icon: '🔍', title: 'I need a house',   sub: 'Looking to rent'        },
                  { key: 'landlord', icon: '🏠', title: 'I have a house',    sub: 'Want to list it free'   },
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    style={{ ...styles.roleCard, ...(role === r.key ? styles.roleCardSel : {}) }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                    <div style={styles.roleTitle}>{r.title}</div>
                    <div style={styles.roleSub}>{r.sub}</div>
                  </button>
                ))}
              </div>
              {errors.role && <p style={styles.err}>{errors.role}</p>}

              <form onSubmit={handleSubmit}>
                {/* Name row */}
                <div style={styles.row2}>
                  {[
                    { key: 'firstName', label: 'First name', placeholder: 'Sarah'  },
                    { key: 'lastName',  label: 'Last name',  placeholder: 'Nakamya' },
                  ].map(f => (
                    <div key={f.key} style={styles.field}>
                      <label style={styles.fieldLabel}>{f.label}</label>
                      <input
                        style={{ ...styles.input, ...(errors[f.key] ? styles.inputErr : {}) }}
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      />
                      {errors[f.key] && <p style={styles.err}>{errors[f.key]}</p>}
                    </div>
                  ))}
                </div>

                {/* Phone */}
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Phone number</label>
                  <input
                    style={{ ...styles.input, ...(errors.phone ? styles.inputErr : {}) }}
                    type="tel"
                    placeholder="+256 701 234 567"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <p style={styles.err}>{errors.phone}</p>}
                </div>

                {/* Area */}
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Area in Kampala</label>
                  <select
                    style={{ ...styles.input, ...(errors.area ? styles.inputErr : {}) }}
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                  >
                    <option value="">Select your area...</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                  {errors.area && <p style={styles.err}>{errors.area}</p>}
                </div>

                {errors.submit && <p style={{ ...styles.err, marginBottom: 12 }}>{errors.submit}</p>}

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Saving your spot...' : "Join the waiting list — it's free"}
                </button>
              </form>

              <div style={styles.proofRow}>
                {['No spam, ever', 'SMS when we launch', 'Always free'].map(p => (
                  <span key={p} style={styles.proofItem}>{p}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'success' && confirmation && (
          <>
            {/* SUCCESS HERO */}
            <div style={{ ...styles.hero, paddingBottom: 32 }}>
              <div style={styles.checkCircle}>
                <span style={{ fontSize: 36, color: '#1b3d2c' }}>✓</span>
              </div>
              <h2 style={{ ...styles.heroH1, marginTop: 16 }}>You're on the list.</h2>
              <p style={styles.heroPara}>
                We'll text {confirmation.firstName} the moment Nyumba launches in Kampala.
                No broker. Zero commission. Just your home.
              </p>
              <div style={styles.confBox}>
                <p style={styles.confLabel}>Your spot</p>
                {[
                  ['Name',    `${confirmation.firstName}`            ],
                  ['Area',     confirmation.area                     ],
                  ['You are',  confirmation.role === 'tenant' ? 'Tenant looking for a house' : 'Landlord with a house to list'],
                ].map(([k, v]) => (
                  <div key={k} style={styles.confRow}>
                    <span style={styles.confKey}>{k}</span>
                    <span style={styles.confVal}>{v}</span>
                  </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <div style={styles.posNum}>#{confirmation.position}</div>
                  <div style={{ fontSize: 13, color: '#7dc9a0' }}>on the waiting list</div>
                </div>
              </div>
            </div>

            {/* SHARE */}
            <div style={styles.card}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1b3d2c', marginBottom: 4 }}>
                Tell your people. Skip the broker together.
              </h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
                Every person you bring gets early access too. Share before the brokers find out.
              </p>
              <div style={styles.shareGrid}>
                <button type="button" onClick={shareWhatsApp} style={styles.shareBtn}>
                  Share on WhatsApp
                </button>
                <button type="button" onClick={copyLink} style={styles.shareBtn}>
                  Copy referral link
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

// ──────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────
const styles = {
  main:       { maxWidth: 480, margin: '0 auto', padding: '16px 16px 48px', fontFamily: 'system-ui, sans-serif' },
  hero:       { background: '#1b3d2c', borderRadius: 20, padding: '36px 28px 32px', textAlign: 'center', marginBottom: 16 },
  logoBox:    { width: 64, height: 64, background: 'rgba(255,255,255,.12)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' },
  heroKicker: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#7dc9a0', marginBottom: 8 },
  heroH1:     { fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: -1.2, lineHeight: 1.15, marginBottom: 10 },
  heroPara:   { fontSize: 14, color: '#7dc9a0', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' },
  tagRow:     { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  tag:        { background: 'rgba(125,201,160,.2)', color: '#7dc9a0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 },
  statCard:   { background: '#f4f2ee', borderRadius: 12, padding: 14, textAlign: 'center' },
  statNum:    { fontSize: 24, fontWeight: 800, color: '#1b3d2c' },
  statLbl:    { fontSize: 11, color: '#888', marginTop: 2 },
  card:       { background: '#fff', border: '0.5px solid #e5e1da', borderRadius: 20, padding: '24px 22px', marginBottom: 14 },
  cardH2:     { fontSize: 18, fontWeight: 800, color: '#1b3d2c', letterSpacing: -.4, marginBottom: 4 },
  cardPara:   { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 },
  roleGrid:   { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 },
  roleCard:   { border: '2px solid #e5e1da', borderRadius: 14, padding: 14, cursor: 'pointer', textAlign: 'center', background: '#fff', transition: 'all .15s' },
  roleCardSel:{ border: '2px solid #1b3d2c', background: '#f0f7f2' },
  roleTitle:  { fontSize: 14, fontWeight: 700, color: '#1a1a1a' },
  roleSub:    { fontSize: 12, color: '#888', marginTop: 2 },
  row2:       { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  field:      { marginBottom: 14 },
  fieldLabel: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase', color: '#3a7d57', marginBottom: 6 },
  input:      { width: '100%', background: '#f4f2ee', border: '1.5px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', color: '#1a1a1a' },
  inputErr:   { borderColor: '#a32d2d' },
  err:        { fontSize: 12, color: '#a32d2d', marginTop: 4 },
  submitBtn:  { width: '100%', background: '#1b3d2c', color: '#fff', border: 'none', borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  proofRow:   { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' },
  proofItem:  { fontSize: 12, color: '#888' },
  checkCircle:{ width: 72, height: 72, background: '#dff0e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  confBox:    { background: 'rgba(255,255,255,.1)', borderRadius: 14, padding: '14px 16px', marginTop: 18, textAlign: 'left' },
  confLabel:  { fontSize: 11, color: '#7dc9a0', fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase', marginBottom: 10 },
  confRow:    { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '.5px solid rgba(255,255,255,.1)' },
  confKey:    { color: 'rgba(255,255,255,.7)', fontSize: 13 },
  confVal:    { color: '#fff', fontWeight: 700, fontSize: 13 },
  posNum:     { fontSize: 36, fontWeight: 900, color: '#7dc9a0' },
  shareGrid:  { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  shareBtn:   { padding: 12, border: '0.5px solid #e5e1da', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1b3d2c', background: '#fff' },
};
