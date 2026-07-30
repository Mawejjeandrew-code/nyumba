import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLandlordToken, getLandlordUserId } from '../../../lib/landlordAuth';
import { landlordFetch } from '../../../lib/landlordFetch';
import { fetchListing } from '../../../lib/publicFetch';
import { uploadListingPhoto, deleteListingPhoto } from '../../../lib/uploadPhoto';
import InquiryForm from '@/components/InquiryForm';
const AMENITIES = [
  ['water', 'Water'], ['electricity', 'Electricity'], ['security', 'Security'],
  ['parking', 'Parking'], ['wifi', 'WiFi'], ['solar', 'Solar'],
  ['fenced', 'Fenced compound'], ['cctv', 'CCTV'],
  ['garbage_collection', 'Garbage collection'], ['pets_allowed', 'Pets allowed'],
];

export default function EditListing() {
  const router = useRouter();
  const { id } = router.query;
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getLandlordToken();
      if (!token) {
        router.replace('/landlord/login');
        return;
      }
      setUserId(await getLandlordUserId());
    })();
  }, [router]);

  useEffect(() => {
    if (!id) return;
    fetchListing(id)
      .then((l) =>
        setForm({
          title: l.title || '',
          area: l.area || '',
          bedrooms: l.bedrooms || 1,
          price_ugx: l.price_ugx || '',
          description: l.description || '',
          amenities: l.amenities || [],
          photos: (l.photo_urls || []).map((url) => ({ url })),
        })
      )
      .catch((e) => setError(e.message));
  }, [id]);

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
        setError(err.message);
      }
    }
  }

  async function removePhoto(photo) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== photo) }));
    if (photo.path) {
      try { await deleteListingPhoto(photo.path); } catch { /* non-fatal */ }
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await landlordFetch(`/listings/${id}`, {
        method: 'PATCH',
        body: {
          title: form.title,
          area: form.area,
          bedrooms: Number(form.bedrooms),
          price_ugx: Number(form.price_ugx),
          description: form.description,
          amenities: form.amenities,
          photo_urls: form.photos.map((p) => p.url),
        },
      });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !form) {
    return (
      <div className="state-page">
        <p>{error}</p>
        <Link href="/landlord/dashboard">Back to dashboard</Link>
        <style jsx>{stateStyles}</style>
      </div>
    );
  }

  if (!form) {
    return <div className="state-page">Loading…<style jsx>{stateStyles}</style></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/landlord/dashboard" className="back"><i className="ti ti-arrow-left" /> Back to dashboard</Link>
      </header>

      <main>
        <h1>Edit listing</h1>

        <div className="card">
          <label>Title</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} />

          <div className="two-col">
            <div>
              <label>Area</label>
              <input value={form.area} onChange={(e) => set('area', e.target.value)} />
            </div>
            <div>
              <label>Bedrooms</label>
              <input type="number" min={1} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
            </div>
          </div>

          <label>Monthly rent (UGX)</label>
          <input type="number" value={form.price_ugx} onChange={(e) => set('price_ugx', e.target.value)} />

          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />

          <label>Amenities</label>
          <div className="amenity-grid">
            {AMENITIES.map(([key, lbl]) => (
              <button
                key={key}
                type="button"
                className={`chip ${form.amenities.includes(key) ? 'active' : ''}`}
                onClick={() => toggleAmenity(key)}
              >
                {form.amenities.includes(key) && <i className="ti ti-check" />} {lbl}
              </button>
            ))}
          </div>

          <label>Photos</label>
          <div className="photo-grid">
            {form.photos.map((p, i) => (
              <div key={p.tempId || p.url || i} className="photo-tile">
                {p.uploading ? (
                  <div className="uploading">Uploading…</div>
                ) : (
                  <>
                    <img src={p.url} alt="" />
                    <button className="remove" onClick={() => removePhoto(p)}><i className="ti ti-x" /></button>
                  </>
                )}
              </div>
            ))}
            <label className="add-photo">
              <i className="ti ti-plus" /> Add
              <input type="file" accept="image/*" multiple hidden onChange={handlePhotoSelect} />
            </label>
          </div>

          {error && <div className="error">{error}</div>}
          {saved && <div className="success"><i className="ti ti-circle-check" /> Saved.</div>}

          <button className="save" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </main>

      <style jsx>{pageStyles}</style>
    </div>
  );
}

const pageStyles = `
  .page { min-height: 100vh; background: #f4f2ee; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  .topbar { padding: 16px 24px; }
  .back { color: #6b6558; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 4px; width: fit-content; }
  main { max-width: 560px; margin: 0 auto; padding: 8px 24px 80px; }
  h1 { font-size: 22px; color: #0d2018; margin: 0 0 16px; }
  .card { background: #fff; border: 1px solid #e7e3d9; border-radius: 14px; padding: 24px; }
  label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; color: #8a8474; margin: 16px 0 6px; }
  label:first-child { margin-top: 0; }
  input, textarea { width: 100%; padding: 11px 14px; border: 1px solid #d8d2c2; border-radius: 9px; font-size: 14px; box-sizing: border-box; font-family: inherit; }
  .two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
  .amenity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .chip { padding: 10px 12px; border-radius: 8px; border: 1px solid #d8d2c2; background: #fff; font-size: 13px; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 6px; }
  .chip.active { background: #e3efe6; border-color: #1b4332; color: #1b4332; font-weight: 600; }
  .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .photo-tile { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #eee9de; }
  .photo-tile img { width: 100%; height: 100%; object-fit: cover; }
  .uploading { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 10px; color: #8a8474; }
  .remove { position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: rgba(13,32,24,0.7); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .add-photo { aspect-ratio: 1; border-radius: 8px; border: 1px dashed #d8d2c2; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 10px; color: #8a8474; cursor: pointer; }
  .error { margin-top: 16px; background: #fbe4e2; color: #b3261e; padding: 10px 12px; border-radius: 8px; font-size: 13px; }
  .success { margin-top: 16px; background: #e3efe6; color: #1b4332; padding: 10px 12px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 6px; }
  .save { width: 100%; margin-top: 18px; background: #1b4332; color: #fff; border: none; padding: 13px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .save:disabled { opacity: 0.6; }
`;

const stateStyles = `
  .state-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px; background: #f4f2ee; color: #6b6558; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
`;