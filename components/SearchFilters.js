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
    return
}