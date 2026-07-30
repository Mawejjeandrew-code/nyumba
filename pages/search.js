import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import SearchFilters from '../components/SearchFilters';
import ListingCard from '../components/ListingCard';
import NotifyMeForm from '../components/NotifyMeForm';
import { fetchSearch } from '../lib/publicFetch';

export default function Search() {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNotify, setShowNotify] = useState(false);

  const runSearch = useCallback((f) => {
    setLoading(true);
    setError('');
    fetchSearch({
      area: f.area,
      min_price: f.min_price,
      max_price: f.max_price,
      bedrooms: f.bedrooms,
      amenities: (f.amenities || []).join(','),
      verified_only: f.verified_only ? 'true' : '',
    })
      .then((data) => setResults(data.results || data.listings || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    runSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(next) {
    setFilters(next);
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(filters);
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="dot" /> Nyumba
        </Link>
        <div className="tagline">No broker. Just home.</div>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <SearchFilters filters={filters} onChange={handleFilterChange} />
          <div className="submit-row">
            <button type="button" className="notify" onClick={() => setShowNotify(true)}>
              <i className="ti ti-bell" /> Notify me about new matches
            </button>
            <button type="submit" className="submit">
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {!error && results && results.length === 0 && !loading && (
          <div className="empty">
            <i className="ti ti-home-search" />
            <div>No listings match those filters yet — try widening your search.</div>
            <button className="empty-notify" onClick={() => setShowNotify(true)}>
              Get notified when one appears
            </button>
          </div>
        )}

        {results && results.length > 0 && (
          <>
            <div className="count">{results.length} house{results.length === 1 ? '' : 's'} found</div>
            <div className="grid">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </main>

      {showNotify && <NotifyMeForm filters={filters} onClose={() => setShowNotify(false)} />}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f4f2ee;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .topbar {
          background: #0d2018;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f4f2ee;
          font-weight: 700;
          font-size: 17px;
          text-decoration: none;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3ba26a;
        }
        .tagline {
          color: rgba(244, 242, 238, 0.55);
          font-size: 13px;
        }
        main {
          max-width: 1080px;
          margin: 0 auto;
          padding: 24px 24px 80px;
        }
        .submit-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin: 12px 0 24px;
        }
        .notify {
          background: none;
          border: 1px solid #d8d2c2;
          color: #4a4536;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notify:hover {
          border-color: #1b4332;
          color: #1b4332;
        }
        .submit {
          background: #1b4332;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .submit:hover {
          opacity: 0.9;
        }
        .error {
          background: #fbe4e2;
          color: #b3261e;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
        }
        .empty {
          text-align: center;
          padding: 64px 24px;
          color: #8a8474;
        }
        .empty i {
          font-size: 32px;
          display: block;
          margin-bottom: 10px;
        }
        .empty-notify {
          margin-top: 16px;
          background: #e8a33d;
          color: #29200a;
          border: none;
          padding: 11px 22px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .count {
          font-size: 13px;
          color: #8a8474;
          margin-bottom: 12px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}