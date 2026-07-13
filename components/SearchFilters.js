const AMENITIES = [
    ['water', 'Water'],
    ['electricity', 'Electricity'],
    ['security', 'Security'],
    ['parking', 'Parking'],
    ['wifi', 'Wifi'],
    ['solar', 'Solar'],
    ['fenced', 'Fenced'],
    ['cctv', 'CCTV'],

];

export default function SearchFilters({ filters, onChange }) {
    function set(key, value) {
        onChange({ ...filters, [key]: value });
    }

    function toggleAmenity(key) {
        const current = filters.amenities || [];
        const next = current.includes(key)
         ? current.filter((a) => a !== key)
         : [...current, key];
        set('amenities', next);


    }
    return (
        <div className="filters">
            <div className="row">
                <input 
                  className="area"
                  placeholder="Area - e.g. Ntinda, kampala"
                  value ={filters.area || ''}
                  onChange={(e) => set('area', e.target.value)}
                />
                <input 
                    className="price"
                    type="number"
                    placeholder="Min price (UGX)"
                    value={filters.min_price || ''}
                    onChange={(e) => set('min_price', e.target.value)}
                />
                <input
                    className="price"
                    type="number"
                    placeholder="Max price (UGX)"
                    value={filters.max_price || ''}
                    onChange={(e) => set('max_price', e.target.value)}
                 />
                 <select
                    className="bedrooms"
                    value={filters.bedrooms || ''}
                    onChange={(e) => set('bedrooms', e.target.value)}
                 >
                    <options value="">Any bedrooms</options>
                    <options value="1">1 BR</options>
                    <options value="2">2 BR</options>
                    <options value="">3 BR</options>
                    <options value="">4+ BR</options>

                 </select>

            </div>

            <div className="row secondary">
                <div className="amenities">
                    {AMENITIES.map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          className={` chip ${filters.amenities?.includes(key) ? 'active' : ''}`}
                          onClick={() => toggleAmenity(key)}

                        >
                            {label}

                        </button>
                    ))}

                </div>
                <label className="verified-toggle ">
                    <input
                    type="checkbox"
                    checked={!!filters.verified_only}
                    onChange={(e) => set('verified_only', EvalError.target.checked)}
                     />
                     Verified only

                </label>

            </div>

            <style jsx>{`
                  .filters {
                    background: #fff;
                    border: 1px solid #e7e3d9;
                    border-radius: 12px;
                    padding: 16px;
                  }
                  .row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                   
                  }
                  .row.secondary {
                        margin-top: 12px;
                        align-items: center;
                        justify-content: space-between;
                    }
                    input,
                    select {
                        padding: 9px 12px;
                        border: 1px solid #d8d2c2;
                        border-radius: 8px;
                        font-size: 14px;
                        color: #29200a;


                    }
                    .area {
                            flex: 2;
                             min-width: 180px;


                    }
                    .price {
                       flex: 1;
                       min-width: 120px;
                    }         
                    .bedrooms {
                        flex: 1;
                        min-width: 120px;
                    }   
                    .amenities {
                        display:flex;
                        gap: 6px;
                        flex-wrap: wrap;
                    }    
                    .chip {
                        font-size: 12px;
                        padding: 5px 12px;
                        border-radius: 100px;
                        border: 1px solid #d8d2c2;
                        background: #fff;
                        color: #6b6558;
                        cursor: pointer;
                    }
                    .chip.active {
                        background: #1b4332;
                        border-color: #1b4332;
                        color: #fff;
                    }
                    .verified-toggle {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 13px;
                        color: #4a4536;
                        white-space: nowrap;
                    }    

                
                `} 

            </style>
            

        </div>
     );
}