
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AREAS = ['All', 'Ntinda', 'Kisaasi', 'Naguru', 'Naalya', 'Najjera',
               'Mutungo', 'Bugolobi', 'Kololo', 'Muyenga', 'Other'];

export default function AdminDashboard() {
  const [entries, setEntries]     = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ role: 'all', area: 'All', search: '' });
  const [sortBy, setSortBy]       = useState('created_at');
  const [page, setPage]           = useState(0);
  const [exporting, setExporting] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => { loadData(); }, [filter, sortBy, page]);

  async function loadData() {
    setLoading(true);
    try {
      // Stats
      const { data: s } = await supabase
        .from('waitlist_stats').select('*').single();
      if (s) setStats(s);

      // Entries with filters
      let q = supabase.from('waitlist')
        .select('id, created_at, first_name, last_name, phone, role, area, position, sms_sent, referral_code')
        .order(sortBy, { ascending: sortBy === 'position' })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filter.role !== 'all') q = q.eq('role', filter.role);
      if (filter.area !== 'All') q = q.eq('area', filter.area);
      if (filter.search) {
        q = q.or(
          `first_name.ilike.%${filter.search}%,` +
          `last_name.ilike.%${filter.search}%,` +
          `phone.ilike.%${filter.search}%`
        );
      }

      const { data, error } = await q;
      if (error) throw error;
      setEntries(data || []);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function exportCSV() {
    setExporting(true);
    const { data } = await supabase
      .from('waitlist')
      .select('position, first_name, last_name, phone, role, area, created_at, sms_sent')
      .order('position');

    if (!data) { setExporting(false); return; }

    const header = ['Position', 'First name', 'Last name', 'Phone', 'Role', 'Area', 'Signed up', 'SMS sent'];
    const rows = data.map(r => [
      r.position,
      r.first_name,
      r.last_name,
      r.phone,
      r.role,
      r.area,
      new Date(r.created_at).toLocaleDateString('en-GB'),
      r.sms_sent ? 'Yes' : 'No',
    ]);

    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `nyumba-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function initials(first, last) {
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
  }

  return (
    <div style={s.wrap}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoWrap}>
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <path d="M10 26L26 12L42 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="15" y="26" width="22" height="16" rx="2" fill="white"/>
              <rect x="22" y="32" width="8" height="10" rx="1" fill="#1b3d2c"/>
              <circle cx="38" cy="18" r="5" fill="#7dc9a0"/>
            </svg>
          </div>
          <div>
            <div style={s.headerTitle}>Nyumba Admin</div>
            <div style={s.headerSub}>Waitlist manager</div>
          </div>
        </div>
        <button onClick={exportCSV} disabled={exporting} style={s.exportBtn}>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* STATS */}
      <div style={s.statsGrid}>
        {[
          { n: stats.total     || 0, l: 'Total signups',  c: '#1b3d2c' },
          { n: stats.tenants   || 0, l: 'Tenants',        c: '#1b3d2c' },
          { n: stats.landlords || 0, l: 'Landlords',      c: '#1b3d2c' },
          { n: stats.areas_covered || 0, l: 'Areas',      c: '#d4820a' },
        ].map(st => (
          <div key={st.l} style={s.statCard}>
            <div style={{ ...s.statNum, color: st.c }}>{st.n}</div>
            <div style={s.statLbl}>{st.l}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={s.filterBar}>
        <input
          style={s.search}
          type="text"
          placeholder="Search name or phone..."
          value={filter.search}
          onChange={e => { setFilter({ ...filter, search: e.target.value }); setPage(0); }}
        />
        <select
          style={s.select}
          value={filter.role}
          onChange={e => { setFilter({ ...filter, role: e.target.value }); setPage(0); }}
        >
          <option value="all">All roles</option>
          <option value="tenant">Tenants</option>
          <option value="landlord">Landlords</option>
        </select>
        <select
          style={s.select}
          value={filter.area}
          onChange={e => { setFilter({ ...filter, area: e.target.value }); setPage(0); }}
        >
          {AREAS.map(a => <option key={a}>{a}</option>)}
        </select>
        <select
          style={s.select}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="created_at">Newest first</option>
          <option value="position">By position</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['#', 'Person', 'Phone', 'Role', 'Area', 'Signed up', 'SMS'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#888', padding: 32 }}>Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#888', padding: 32 }}>No results</td></tr>
            ) : entries.map(e => (
              <tr key={e.id} style={s.tr}>
                <td style={s.td}>
                  <span style={{ fontWeight: 700, color: '#1b3d2c', fontSize: 14 }}>#{e.position}</span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ ...s.av, background: e.role === 'tenant' ? '#dff0e8' : '#fef0d0' }}>
                      {initials(e.first_name, e.last_name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                        {e.first_name} {e.last_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={s.td}>
                  <a href={`tel:${e.phone}`} style={{ color: '#1b3d2c', fontSize: 13, textDecoration: 'none' }}>
                    {e.phone}
                  </a>
                </td>
                <td style={s.td}>
                  <span style={{
                    background: e.role === 'tenant' ? '#dff0e8' : '#fef0d0',
                    color:      e.role === 'tenant' ? '#0d4020' : '#7a4400',
                    borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700
                  }}>
                    {e.role}
                  </span>
                </td>
                <td style={{ ...s.td, fontSize: 13, color: '#555' }}>{e.area}</td>
                <td style={{ ...s.td, fontSize: 12, color: '#888' }}>{formatDate(e.created_at)}</td>
                <td style={s.td}>
                  <span style={{
                    background: e.sms_sent ? '#dff0e8' : '#f4f2ee',
                    color:      e.sms_sent ? '#0d4020' : '#888',
                    borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700
                  }}>
                    {e.sms_sent ? 'Sent' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div style={s.pagination}>
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={s.pageBtn}
        >
          Previous
        </button>
        <span style={{ fontSize: 13, color: '#888' }}>
          Page {page + 1} · showing {entries.length} entries
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={entries.length < PAGE_SIZE}
          style={s.pageBtn}
        >
          Next
        </button>
      </div>

    </div>
  );
}

const s = {
  wrap:        { maxWidth: 960, margin: '0 auto', padding: '20px 16px 48px', fontFamily: 'system-ui, sans-serif' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  logoWrap:    { width: 48, height: 48, background: '#1b3d2c', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 800, color: '#1b3d2c' },
  headerSub:   { fontSize: 12, color: '#888' },
  exportBtn:   { background: '#1b3d2c', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 },
  statCard:    { background: '#f4f2ee', borderRadius: 12, padding: '14px 16px', textAlign: 'center' },
  statNum:     { fontSize: 28, fontWeight: 900 },
  statLbl:     { fontSize: 11, color: '#888', marginTop: 3 },
  filterBar:   { display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  search:      { flex: 2, minWidth: 160, background: '#f4f2ee', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none' },
  select:      { flex: 1, minWidth: 120, background: '#f4f2ee', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none', cursor: 'pointer' },
  tableWrap:   { background: '#fff', border: '0.5px solid #e5e1da', borderRadius: 16, overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: .6, textTransform: 'uppercase', background: '#f9f8f6', borderBottom: '0.5px solid #e5e1da' },
  td:          { padding: '12px 14px', borderBottom: '0.5px solid #f0ede6' },
  tr:          { transition: 'background .1s' },
  av:          { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0d4020', flexShrink: 0 },
  pagination:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  pageBtn:     { background: '#fff', border: '0.5px solid #e5e1da', borderRadius: 10, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#1b3d2c', fontWeight: 600 },
};

// ──────────────────────────────────────────
// ROUTE PROTECTION
// Create: middleware.js at project root
// ──────────────────────────────────────────
export const middlewareCode = `
// middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /admin routes — redirect to login if not authenticated
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = { matcher: ['/admin/:path*'] }
`;
