import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HotelIcon, Building2Icon, BusIcon, LandmarkIcon } from 'lucide-react';

const defaultFacilities = [
  { id: 'hotel-1', type: 'Hotel', name: 'Sunrise Hotel', capacity: 100, amenities: ['Pool', 'WiFi'], price: 120, photos: [], description: '4-star hotel in city center.' },
  { id: 'room-a', type: 'Function Room', name: 'Conference Room A', capacity: 12, amenities: ['Projector', 'Whiteboard'], price: 50, photos: [], description: 'Ideal for meetings.' },
  { id: 'bus-1', type: 'Vehicle', name: 'Tour Bus #1', capacity: 40, amenities: ['AC', 'TV'], price: 200, photos: [], description: 'Comfortable bus for group tours.' },
  { id: 'museum', type: 'Attraction', name: 'City Museum', capacity: 200, amenities: ['Guided Tours'], price: 10, photos: [], description: 'Explore local history.' },
];

export default function CatalogTab() {
  const [facilities, setFacilities] = useState(defaultFacilities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchFacilities() {
      try {
        const res = await fetch('http://localhost:4000/facilities');
        if (!res.ok) throw new Error('Failed to load facilities');
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data.map(f => ({
            ...f,
            amenities: Array.isArray(f.amenities) ? f.amenities : (typeof f.amenities === 'string' ? f.amenities.split(',').map(a => a.trim()).filter(Boolean) : []),
            price: typeof f.price === 'string' ? parseFloat(f.price) : f.price
          })));
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || 'Failed to load facilities');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchFacilities();
    return () => { mounted = false; };
  }, []);

  const facilityIcons = {
    Hotel: <HotelIcon className="text-blue-500" />,
    'Function Room': <Building2Icon className="text-purple-500" />,
    Vehicle: <BusIcon className="text-green-500" />,
    Attraction: <LandmarkIcon className="text-pink-500" />,
  };

  if (loading) return <Card className="p-4 mb-4"><CardContent>Loading facilities...</CardContent></Card>;

  return (
    <Card className="p-4 mb-4">
      <CardContent>
        <h3 className="font-semibold mb-3 text-xl text-blue-700">Available Facilities</h3>
        {error && <div className="text-red-700 mb-2">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col gap-2 hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-2">
                {facilityIcons[f.type] || <Building2Icon className="text-gray-400" />}
                <span className="font-bold text-lg text-blue-700">{f.name}</span>
                <span className="ml-auto px-2 py-1 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">{f.type}</span>
              </div>
              <div className="text-sm text-slate-600"><b>Capacity:</b> {f.capacity || 'N/A'}</div>
              <div className="text-sm text-slate-600"><b>Amenities:</b> {Array.isArray(f.amenities) ? f.amenities.join(', ') : (f.amenities || '—')}</div>
              <div className="text-sm text-slate-600"><b>Price:</b> ${f.price} <span className="text-xs text-slate-500">{f.type === 'Hotel' ? 'per night' : 'per hour'}</span></div>
              <div className="text-xs text-slate-500 mt-2">{f.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
