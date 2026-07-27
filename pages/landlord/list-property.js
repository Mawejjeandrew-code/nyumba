import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLandlordToken, getLandlordUserId } from '../../lib/landlordAuth';
import { landlordFetch } from '../../lib/landlordFetch';
import { uploadListingPhoto, deleteListingPhoto } from '../../lib/uploadphoto';

const STEPS = ['Type', 'Location', 'Amenities', 'Photos', 'Review'];

const AMENITIES = [
  ['water', 'Water'],
  ['electricity', 'Electricity'],
  ['security', 'Security'],
  ['parking', 'Parking'],
  ['wifi', 'WiFi'],
  ['solar', 'Solar'],
  ['fenced', 'Fenced compound'],
  ['cctv', 'CCTV'],
  ['garbage_collection', 'Garbage collection'],
  ['pets_allowed', 'Pets allowed'],
];

const EMPTY_FORM = {
  bedrooms: 1,
  title: '',
  area: '',
  amenities: [],
  photos: [], // [{ url, path, uploading }]
  price_ugx: '',
  description: '',
};

export default function ListProperty() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await getLandlordToken();
      if (!token) {
        router.replace('/landlord/login');
        return;
      }
      setUserId(await getLandlordUserId());
      setCheckingAuth(false);
    })();
  }, [router]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(key) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter((a) => a !== key)
        : [...f.amenities, key],
    }));
  }

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      const tempId = `${Date.now()}-${Math.random()}`;
      setForm((f) => ({ ...f, photos: [...f.photos, { tempId, uploading: true }] }));
      try {
        const { url, path } = await uploadListingPhoto(file, userId);
        setForm((f) => ({
          ...f,
          photos: f.photos.map((p) => (p.tempId === tempId ? { url, path, uploading: false } : p)),
        }));
      } catch (err) {
        setForm((f) => ({ ...f, photos: f.photos.filter((p) => p.tempId !== tempId) }));
        setSubmitError(err.message);
      }
    }
  }

  async function removePhoto(photo) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== photo) }));
    if (photo.path) {
      try { await deleteListingPhoto(photo.path); } catch { /* non-fatal */ }
    }
  }

  function canAdvance() {
    if (step === 0) return form.bedrooms > 0;
    if (step === 1) return form.area.trim().length > 0 && form.title.trim().length > 0;
    if (step === 3) return form.photos.length > 0 && !form.photos.some((p) => p.uploading);
    if (step === 4) return Number(form.price_ugx) > 0;
    return true;
  }

  async function handlePublish() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await landlordFetch('/listings/submit', {
        method: 'POST',
        body: {
          title: form.title,
          area: form.area,
          bedrooms: Number(form.bedrooms),
          amenities: form.amenities,
          photo_urls: form.photos.map((p) => p.url),
          price_ugx: Number(form.price_ugx),
          description: form.description,
        },
      });
      setDone(result);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return <div className="loading-page">Checking your session…<style jsx>{loadingStyles}</style></div>;
  }

  if (done) {
    return (
      <div className="done-page">
        <div className="done-card">
          <div className="done-icon"><i className="ti ti-circle-check" /></div>
          <h1>Submitted for verification</h1>
          <p>
            A Nyumba agent will visit and verify "{form.title}" — usually within 24 hours.
            You'll be notified the moment it goes live and starts appearing in tenant searches.
          </p>
          <Link href="/landlord/list-property" className="again" onClick={() => { setDone(null); setForm(EMPTY_FORM); setStep(0); }}>
            List another property
          </Link>
        </div>
        <style jsx>{doneStyles}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/" className="brand"><span className="dot" /> Nyumba</Link>
      </header>

      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="progress-labels">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? 'active' : ''}>{s}</span>
          ))}
        </div>
      </div>

      <main>
        {step === 0 && (
          <StepCard title="What kind of place is it?">
            <div className="bedroom-picker">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={form.bedrooms === n ? 'active' : ''}
                  onClick={() => set('bedrooms', n)}
                >
                  {n} {n === 1 ? 'bedroom' : 'bedrooms'}
                </button>
              ))}
            </div>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="Where is it, and what should we call it?">
            <label>Listing title</label>
            <input
              placeholder='e.g. "Cozy 2BR near Ntinda market"'
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            <label>Area</label>
            <input
              placeholder="e.g. Ntinda, Kampala"
              value={form.area}
              onChange={(e) => set('area', e.target.value)}
            />
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="What does the house have?">
            <div className="amenity-grid">
              {AMENITIES.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`amenity-chip ${form.amenities.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleAmenity(key)}
                >
                  {form.amenities.includes(key) && <i className="ti ti-check" />} {label}
                </button>
              ))}
            </div>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard title="Add photos">
            <p className="tip">
              "Good lighting and a wide-angle shot of the sitting room get 3x more replies."
              <span> — Moses Kato, landlord in Kireka</span>
            </p>
            <div className="photo-grid">
              {form.photos.map((p, i) => (
                <div key={p.tempId || p.path} className="photo-tile">
                  {p.uploading ? (
                    <div className="uploading">Uploading…</div>
                  ) : (
                    <>
                      <img src={p.url} alt="" />
                      <button className="remove" onClick={() => removePhoto(p)}>
                        <i className="ti ti-x" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              <label className="add-photo">
                <i className="ti ti-plus" />
                Add photo
                <input type="file" accept="image/*" multiple hidden onChange={handlePhotoSelect} />
              </label>
            </div>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard title="Set your price and review">
            <label>Monthly rent (UGX)</label>
            <input
              type="number"
              placeholder="e.g. 450000"
              value={form.price_ugx}
              onChange={(e) => set('price_ugx', e.target.value)}
            />
            <label>Description (optional)</label>
            <textarea
              rows={4}
              placeholder="Anything a tenant should know — nearby landmarks, house rules, availability date…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />

            <div className="review-summary">
              <div><strong>{form.title || 'Untitled listing'}</strong></div>
              <div>{form.area || '—'} · {form.bedrooms} BR</div>
              <div>{form.amenities.length} amenities selected</div>
              <div>{form.photos.length} photos</div>
            </div>

            {submitError && <div className="error">{submitError}</div>}
          </StepCard>
        )}
      </main>

      <footer>
        <button
          className="back"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button className="next" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
            Continue
          </button>
        ) : (
          <button className="publish" disabled={!canAdvance() || submitting} onClick={handlePublish}>
            {submitting ? 'Publishing…' : 'Publish for free'}
          </button>
        )}
      </footer>

      <style jsx>{pageStyles}</style>
    </div>
  );
}

function StepCard({ title, children }) {
  return (
    <div className="step-card">
      <h2>{title}</h2>
      {children}
      <style jsx>{`
        .step-card {
          background: #fff;
          border: 1px solid #e7e3d9;
          border-radius: 14px;
          padding: 28px;
        }
        h2 {
          font-size: 19px;
          color: #0d2018;
          margin: 0 0 20px;
        }
        .step-card :global(label) {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #8a8474;
          margin: 14px 0 6px;
        }
        .step-card :global(input),
        .step-card :global(textarea) {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #d8d2c2;
          border-radius: 9px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

const pageStyles = `
  .page {
    min-height: 100vh;
    background: #f4f2ee;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
  }
  .topbar {
    background: #0d2018;
    padding: 16px 24px;
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
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #3ba26a; }
  .progress-wrap { max-width: 560px; margin: 24px auto 0; padding: 0 24px; }
  .progress-track { height: 4px; background: #e7e3d9; border-radius: 100px; }
  .progress-fill { height: 100%; background: #1b4332; border-radius: 100px; transition: width 0.2s; }
  .progress-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #b8ae95; }
  .progress-labels .active { color: #1b4332; font-weight: 600; }
  main { max-width: 560px; margin: 24px auto; padding: 0 24px; flex: 1; width: 100%; box-sizing: border-box; }
  .bedroom-picker { display: flex; flex-direction: column; gap: 8px; }
  .bedroom-picker button {
    padding: 14px 16px; border-radius: 10px; border: 1px solid #d8d2c2;
    background: #fff; text-align: left; font-size: 15px; cursor: pointer;
  }
  .bedroom-picker button.active { background: #1b4332; border-color: #1b4332; color: #fff; }
  .amenity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .amenity-chip {
    padding: 11px 14px; border-radius: 9px; border: 1px solid #d8d2c2;
    background: #fff; font-size: 13px; cursor: pointer; text-align: left;
    display: flex; align-items: center; gap: 6px;
  }
  .amenity-chip.active { background: #e3efe6; border-color: #1b4332; color: #1b4332; font-weight: 600; }
  .tip { font-size: 13px; color: #6b6558; font-style: italic; margin-bottom: 16px; }
  .tip span { font-style: normal; color: #a39c89; }
  .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .photo-tile { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: #eee9de; }
  .photo-tile img { width: 100%; height: 100%; object-fit: cover; }
  .uploading { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #8a8474; }
  .remove {
    position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%;
    background: rgba(13,32,24,0.7); color: #fff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 12px;
  }
  .add-photo {
    aspect-ratio: 1; border-radius: 10px; border: 1px dashed #d8d2c2; background: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; font-size: 12px; color: #8a8474; cursor: pointer;
  }
  .review-summary { margin-top: 18px; padding: 14px 16px; background: #f4f2ee; border-radius: 10px; font-size: 13px; color: #4a4536; line-height: 1.7; }
  .error { margin-top: 14px; background: #fbe4e2; color: #b3261e; padding: 10px 12px; border-radius: 8px; font-size: 13px; }
  footer {
    max-width: 560px; margin: 0 auto; padding: 16px 24px 32px; width: 100%; box-sizing: border-box;
    display: flex; justify-content: space-between; gap: 10px;
  }
  footer button { padding: 12px 22px; border-radius: 9px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
  footer button:disabled { opacity: 0.4; cursor: not-allowed; }
  .back { background: #eee9de; color: #0d2018; }
  .next { background: #1b4332; color: #fff; margin-left: auto; }
  .publish { background: #e8a33d; color: #29200a; margin-left: auto; }
`;

const loadingStyles = `
  .loading-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f4f2ee; color: #8a8474; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
`;

const doneStyles = `
  .done-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0d2018; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .done-card { background: #f4f2ee; border-radius: 16px; padding: 40px 32px; max-width: 420px; text-align: center; }
  .done-icon { font-size: 44px; color: #1b4332; }
  .done-card h1 { font-size: 22px; color: #0d2018; margin: 12px 0 10px; }
  .done-card p { font-size: 14px; color: #6b6558; line-height: 1.6; }
  .again {
    display: inline-block; margin-top: 20px; background: #1b4332; color: #fff;
    padding: 11px 22px; border-radius: 9px; text-decoration: none; font-size: 14px; font-weight: 600;
  }
`;