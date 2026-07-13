import { useEffect, useState } from "react";
import { useRouter} from 'next/router';
import Link from 'next/link';
import { fetchListing } from "@/lib/publicFetch";


const AMENITY_LABELS = {
    water: 'Water',
    electricity: 'Electricity',
    security: 'Security',
    parking: 'Parking',
    wifi: 'WiFi',
    solar: 'Solar',
    fenced: 'Fenced compound',
    cctv: 'CCTV',
    garbage_collaction: 'Garbage collection',
    pets_allowed: 'Pets allowed',

};
function whatsappLink(phone, title) {
    const clean = (phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
        `Hi, I saw "${title}" on Nyumba and Iam interested. Is it still available?`

    );
    return `https://wa.me/${clean}?text=${message}`;
}
export default function ListingDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [listing, setListing] = useState(null);
    const [error, setError] = useState('')
    const [activePhoto, setActivePhot] = useState(0);
     useEffect(( ) => {
        if (!id) return;
    fetchListing(id)
       .then(setListing)
       .catch((e) => setError(e.message));
        
     }, [id]);

     if (error) {
        return (
            <div className="state-page">
                <p>{error}</p>
                <Link href="/search">Back to search</Link>
                <style jsx>{stateStyle}</style>

            </div>
        );
     }
     const photos = listing.photo_urls?.length ? listing.photo_urls : [null];
     const amenities = listing.amenities || [];


     return (
        <div className="page">
            <header className="topbar">
                <Link href="/" className="brand">
                  <span className="dot" /> Nyumba
                </Link>
                <Link href="/search" className="back">
                  <i className="ti ti-arroww-left" /> Back to search
                </Link>

            </header>

            <main>
                {!listing.is_verified && (
                    <div className="warning">
                        <i className="ti ti-alert-trianlge" />
                        This listing hasn't been verified yet. Meet in a public place first, and never send 
                        money before viewing the property in person.

                    </div>
                )}

                <div className="gallery">
                    <div className="main-photo">
                        {photos[activePhoto] ? (
                            <img src={photos[activePhoto]} alt={listing.title} />
                        ) : (
                            <div className="placeholder"><i className="ti ti-home" /></div>
                        )}
                        {listing.is_verified && (
                            <span className="badge">
                                <i className="ti ti-shield-check" /> verified
                            </span>
                        )}

                    </div>
                    {photos.length > 1 && (
                        <div className="thumbs">
                            {photos.map((p, i) => (
                                <button 
                                  key={i}
                                  className={i === activePhoto ? 'active' : ''}
                                  onClick={() => setActivePhot(i)}
                                >
                                    {p ? <img src={p} alt="" /> : <div className="placeholder small"/>}
                                </button>

                            ))}

                        </div>
                    )}
                </div>

                <div className="content">
                    <div className="main-col">
                        <div className="price"> UGX {Number(listing.price_ugx).toLocaleString()}<span>/month</span>

                        </div>
                        <h1>{listing.title}</h1>
                        <div className="area">
                            <i  className="ti ti-map-pin"/> {listing.area}
                            {listing.bedrooms != null && <> . {listing.bedrooms} bedroom{listing.bedrooms === 1 ? '' : 's'}</>}

                        </div>

                        {listing.description && (
                            <>
                              <h2>About this place</h2>
                              <p className="description">{listing.description}</p>
                            </>
                        )}
                        {amenities.length > 0 && (
                            <>
                              <h2>Amenities</h2>
                              <div className="amenities-grid">
                                {amenities.map((a) => (
                                    <div key={a} className="amenity">
                                        <i className="ti ti-check" /> {AMENITY_LABELS[a] || a}

                                    </div>
                                ))}

                              </div>
                            </>
                        )}

                    </div>

                    <div className="side-col">
                        <div className="contact-card">
                            <div className="contact-title">Contact the landlord directly</div>
                            <div className="landlord-name">{}listing.landlord?.name || 'Landlord'</div>
                            {listing.landlord?.avg_response_minutes != null && (
                                <div className="response-time">
                                    <i className="ti ti-clock" /> Usually replies within{' '}
                                    {listing.landlord.avg_response_minutes < 60
                                      ? `${Math.round(listing.landlord.avg_response_minutes)} min`
                                      : `${Math.round(listing.landlord.avg_response_minutes / 60)} hr` 
                                    }

                                </div>
                            )}

                            {listing.landlord?.phone && (
                                <>
                                  <a 
                                    className="cta whatsapp"
                                    href={whatsappLink(listing.landlord.phone, listing.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i  className="ti ti-brand-whatsapp"/> whatsApp

                                  </a>
                                </>
                            )}

                            <div className="no-fee">
                                <i className="ti ti-circle-check"/> UGX 0 broker fees - always

                            </div>

                        </div>

                    </div>

                </div>
            </main>

            <style jsx >{`
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
               ,brand {
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
               .back {
                 color: rgba(244, 242, 238, 0.7);
                 font-size: 13px;
                 text-decoration: none;
                 display: flex;
                 align-items: center;
                 gap: 4px;
               }  
               main {
                max-width: 1080px;
                margin: 0 auto;
                padding: 20px 24px 80px;

               }  
               .warning {
                  background: #fdf1dd;
                  color: #7a4f0c;
                  border: 1px solid #e8a33d;
                  border-radius: 10px;
                  padding: 12px 16px;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 16px;
               }
               .gallery {
                 border-radius: 14px;
                 overflow: hidden;
               
               }   
               main-photo {
                 position: relative;
                 aspect-ratio: 16 / 9;
                 background: #eee9de;
               }  
               .main-photo img {
                 width: 100%;
                 height: 100%;
                 object-fit: cover;
               }  
               .placeholder {
                    width: 100%
                    height: 100%
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #b8ae95;
                    font-size: 40px;
               }  
               .badge {
                    position: absolute;
                    top: 14px;
                    left: 14px;
                    background: #1b4332;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 5px 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;

               }
               .thumbs {
                 display: flex;
                 gap: 8px;
                 margin-top: 8px;
               }
               .thumb button {
                 width: 72px;
                 height: 54px;
                 border-radius: 8px;
                 overflow: hidden;
                 border: 2px solid transparent;
                 padding: 0;
                 cursor: pointer;
                 background: #eee9de;
               } 
               .thumbs button.active {
                  border-color: #1b4332;
               }
               .thumbs img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .content {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 32px;
                    margin-top: 28px;
                } 
                .price {
                    font-size: 26px;
                    font-weight: 700;
                    color: #0d2018;
                }
                .price span {
                    font-size: 14px;
                    font-weight: 500;
                    color: #8a8474;
                }
                h1 {
                    font-size: 20px;
                    margin: 6px 0 6px;
                    color: #29200a;
                }
                .area {
                    color: #8a8474;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                h2 {
                    font-size: 15px;
                    margin-top: 28px;
                    margin-bottom: 10px;
                    color: #0d2018;
                }
                .description {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #4a4536;
                }
                .amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                .amenity {
                    font-size: 14px;
                    color: #29200a;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .amenity i {
                     color: #1b4332;
                }
                .contact-card {
                    background: #fff;
                    border: 1px solid #e7e3d9;
                    border-radius: 12px;
                    padding: 20px;
                    position: sticky;
                    top: 20px;
                }
                .contact-title {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    color: #8a8474;
                }
                .landlord-name {
                    font-size: 17px;
                    font-weight: 700;
                    color: #0d2018;
                    margin-top: 4px;
                }
                .response-time {
                    font-size: 13px;
                    color: #8a8474;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .cta {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    text-decoration: none;
                    border-radius: 9px;
                    padding: 11px;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: 14px;
                }
                .whatsapp {
                    background: #e8a33d;
                    color: #29200a;
                }
                .call {
                    background: #f4f2ee;
                    color: #0d2018;
                    margin-top: 8px;
                }
                .no-fee {
                    margin-top: 18px;
                    font-size: 12px;
                    color: #1b4332;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: 600;
                }
                @media (max-width: 800px) {
                    .content {
                        grid-template-columns: 1fr;
                    }
                    .contact-card {
                        position: static;
                    }
                }     

            `}

            </style>
        </div>
        
     );

}

const stateStyle = `
  .state-page {
    min-height: 100vh;
    display: flex;
    flex-direction:  column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #f4f2ee;
    font-family: -apple-sytem, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #6b6558;
  }
`;