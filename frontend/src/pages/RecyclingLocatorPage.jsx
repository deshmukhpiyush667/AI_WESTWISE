import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Phone,
  Clock,
  ExternalLink,
  Navigation,
  AlertCircle,
  Filter,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { fetchRecyclingCenters } from '../api/client';

export default function RecyclingLocatorPage() {
  const [centers, setCenters] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const materials = ['All', 'Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'];

  const loadCenters = async (material = selectedMaterial, coords = userLocation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecyclingCenters({
        material: material === 'All' ? null : material,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load centers:', err);
      setError('Unable to load recycling facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters(selectedMaterial, userLocation);
  }, [selectedMaterial]);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        loadCenters(selectedMaterial, coords);
      },
      (geoError) => {
        console.warn('Geolocation denied or unavailable:', geoError.message);
        setLocationStatus('denied');
        loadCenters(selectedMaterial, null);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EC] text-xs font-bold text-[#16845B]">
          <Compass className="w-4 h-4" />
          Verified Drop-Off & Recovery Locator
        </div>
        <h2 className="text-3xl font-black text-[#183B2B] tracking-tight">
          Recycling & E-Waste Center Locator
        </h2>
        <p className="text-xs sm:text-sm text-[#52705F]">
          Locate certified municipal collection points, transfer stations, and e-waste facilities accepting your recyclables.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-[#FFFFFF] p-4 sm:p-6 rounded-3xl border border-[#D3EAD7] shadow-card space-y-4 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#16845B]" />
            <span className="text-xs font-bold text-[#183B2B]">Filter Accepted Materials:</span>
          </div>

          <button
            onClick={requestGeolocation}
            disabled={locationStatus === 'requesting'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] transition shadow-xs disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            {locationStatus === 'granted'
              ? 'Location Active (Sorted by Distance)'
              : locationStatus === 'requesting'
              ? 'Detecting Location...'
              : 'Find Centers Near Me'}
          </button>
        </div>

        {/* Location Alerts */}
        {locationStatus === 'denied' && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Location permission was denied. Showing all verified centers with standard sorting.
            </span>
          </div>
        )}

        {/* Material Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F2F9F3]">
          {materials.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedMaterial === mat
                  ? 'bg-[#16845B] text-white shadow-xs'
                  : 'bg-[#F7FAF7] text-[#52705F] hover:bg-[#EAF5EC]'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Center Cards List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] p-8">
            <div className="w-8 h-8 border-3 border-[#16845B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[#52705F]">Loading verified facilities...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center text-xs text-red-800">
            {error}
          </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#D3EAD7] p-8">
            <MapPin className="w-8 h-8 text-[#52705F] mx-auto mb-2" />
            <h4 className="font-bold text-[#183B2B]">No centers found matching this filter</h4>
            <p className="text-xs text-[#52705F] mt-1">Try selecting 'All' materials to view available locations.</p>
          </div>
        ) : (
          centers.map((center) => {
            const acceptedList = Array.isArray(center.accepted_materials)
              ? center.accepted_materials
              : typeof center.accepted_materials === 'string'
              ? center.accepted_materials.split(',').map((s) => s.trim())
              : [];

            const operatingHours = center.operating_hours || center.opening_hours;
            const contactPhone = center.phone || center.contact_phone;

            return (
              <div
                key={center.id}
                className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D3EAD7] shadow-card hover:border-[#16845B] transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-[#183B2B]">{center.name}</h3>
                    {center.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]">
                        <CheckCircle2 className="w-3 h-3" /> Verified Center
                      </span>
                    )}
                    {center.facility_type && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7FAF7] text-[#52705F] border border-[#D3EAD7]">
                        <Building2 className="w-3 h-3 text-[#16845B]" />
                        {center.facility_type}
                      </span>
                    )}
                    {center.distance_km !== null && center.distance_km !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#F2F9F3] text-[#16845B] border border-[#D3EAD7]">
                        {center.distance_km.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-[#52705F]">
                    <MapPin className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
                    <span>{center.address}{center.city ? `, ${center.city}` : ''}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#52705F]">
                    {operatingHours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#16845B]" />
                        <span>{operatingHours}</span>
                      </div>
                    )}
                    {contactPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#16845B]" />
                        <span>{contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Accepted Material Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {acceptedList.map((mat) => (
                      <span
                        key={mat}
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#EAF5EC] border border-[#D3EAD7] text-[#16845B]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Directions Button */}
                <div className="shrink-0 flex items-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${center.name} ${center.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto px-5 py-2.5 bg-[#16845B] hover:bg-[#126e4b] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
