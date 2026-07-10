import Link from 'next/link';

const AMENITY_LABELS = {
    water: 'Water',
    electricty: 'Electricity',
    security: 'Security',
    parking: 'Parking',
    wifi: 'WIFI',
    solar: 'Solar',
    fenced: 'Fenced',
    cctv: 'CCTV',
    garbage_collection: 'Garbage collection',
    pets_allowed: 'Pets allowed',
};

export default function ListingCard({ listing }) {
    const photo = listing.photo_urls?.[0];
    const amenities = (listing.amenities || []).slice(0, 3);

    return (
        <Link href={`/listings/$listing.id`} className='card'>
            <div className="photo">
                {photo ? (
                    <image src={photo} alt={listing.title}/>
                ) : (
                    <div className="placeholder">
                        <i className="ti ti-shield-check"/>

                    </div>
                )}
                {listing.is_verified ? (
                    <span className="badge verified">
                        <i className="ti ti-shield-check" /> Verified

                    </span>
                ) : (
                    <span className="Badge unverified">Not yet verified</span>
                )}
            </div>

            <div className="body">
                <div className="price">UGX {Number(listing.price_ugx).toLocaleString()}<span>/month/
                    </span></div>
                    <div className="title">{listing.title}</div>
                    <div className="area">
                        <i className="ti ti map-pin"  /> {listing.area}
                        {listing.bedroom != null && <> . {listing.bedrooms} BR</>}

                    </div>
                    {amenities.length > 0  && (
                        <div className="amenities">
                            {amenities.map((a) => (
                                <span key={a} className="pill">{AMENITY_LABELS[a] || a}</span>

                            ))}

                        </div>
                    )}

            </div>
            <style jsx>{`
               .card {
                  display: block;
                  text-decoration: none;
                  color: inherit;
                  background: #fff;
                  border: 1px solid #e7e3d9;
                  border-radius: 12px;
                  overflow: hidden;
                  transition: box-shadow 0.15s, transform 0.15s;
               }
                .card:hover {
                   box-shadow: 0 8px 24px rgba(13, 32, 24, 0.08);
                   transform: translateY(-2px);
                     
                }
                .photo {
                   position: relative;
                   aspect-ratio: 4/ 3;
                   background: #ee9de;
                }   
                .photo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }   
                .placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #b8ae95;
                    font-size: 32px;
                }
                .badge {
                  position: absolute;
                  top: 10px;
                  left:10px;
                  font-size: 11px;
                  font-weight: 700;
                  padding: 4px 9px;
                  border-radius: 100px;
                  display: flex;
                  align-items; center;
                  gap: 4px;


                }
                .verified {
                    background: #1b4332;
                    color: #fff;
                }
                .unverified {
                    background: #f4f2ee;
                    color: #6b6558;
                }
                .body {
                padding: 14px 16px 16px;
                }

                .price {
                   font-size: 18px;
                   font-weight: 700;
                   color: #0d2018;
                }
                .price span {
                    font-size: 12px;
                    font-weight: 500;
                    color: #8a8474;
                    margin-left: 2px;
                }   
                .title {
                  font-size: 14px;
                  color: #29200a;
                  margoin-top: 3px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;

                
                } 
                .area {
                    font-size: 13px;
                    coor: #8a8474;
                    margin-top: 5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                } 
                .amenities {
                    display: flex;
                    gap: 6px;
                    margin-top: 10px:
                    flex-wrap: wrap;

                }   
                .pill {
                    font-size: 11px;
                    padding: 3px 8px;
                    border-radius: 100px;
                    background: #f4f2ee;
                    color: #6b6558;
                }         
            `}</style>
        </Link>
    );
}