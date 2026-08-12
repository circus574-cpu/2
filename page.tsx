'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  supabase,
  Workshop,
  ConfiguratorRequest,
  RequestStatus,
} from '@/lib/supabase';
import {
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
  STATUS_LABELS,
} from '@/lib/pricing';

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [requests, setRequests] = useState<ConfiguratorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'settings'>('requests');
  const [savedMsg, setSavedMsg] = useState(false);

  // pola ustawień cennika
  const [priceSteelBlack, setPriceSteelBlack] = useState('');
  const [priceSteelInox, setPriceSteelInox] = useState('');
  const [priceAluminum, setPriceAluminum] = useState('');
  const [laborPrice, setLaborPrice] = useState('');
  const [margin, setMargin] = useState('');

  async function loadData() {
    const { data: ws } = await supabase
      .from('workshops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (ws) {
      setWorkshop(ws);
      setPriceSteelBlack(String(ws.price_steel_black));
      setPriceSteelInox(String(ws.price_steel_inox));
      setPriceAluminum(String(ws.price_aluminum));
      setLaborPrice(String(ws.labor_price_per_mb));
      setMargin(String(ws.margin_percent));

      const { data: reqs } = await supabase
        .from('configurator_requests')
        .select('*')
        .eq('workshop_id', ws.id)
        .order('created_at', { ascending: false });

      setRequests(reqs || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function updateStatus(id: string, status: RequestStatus) {
    await supabase.from('configurator_requests').update({ status }).eq('id', id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  async function saveSettings() {
    if (!workshop) return;
    await supabase
      .from('workshops')
      .update({
        price_steel_black: parseFloat(priceSteelBlack),
        price_steel_inox: parseFloat(priceSteelInox),
        price_aluminum: parseFloat(priceAluminum),
        labor_price_per_mb: parseFloat(laborPrice),
        margin_percent: parseFloat(margin),
      })
      .eq('id', workshop.id);

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#a1a1aa' }}>Ładowanie…</p>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p style={{ color: '#a1a1aa' }}>Nie znaleziono zakładu.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{workshop.name}</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('requests')}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: tab === 'requests' ? '#f97316' : '#1c1c21',
            color: tab === 'requests' ? '#0a0a0b' : '#a1a1aa',
          }}
        >
          Zapytania ({requests.length})
        </button>
        <button
          onClick={() => setTab('settings')}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: tab === 'settings' ? '#f97316' : '#1c1c21',
            color: tab === 'settings' ? '#0a0a0b' : '#a1a1aa',
          }}
        >
          Ustawienia cennika
        </button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 && (
            <p style={{ color: '#71717a' }}>Brak zapytań.</p>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-lg p-4 border"
              style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white font-semibold">
                    {r.contact_name || 'Bez nazwy'}
                  </p>
                  <p className="text-xs" style={{ color: '#71717a' }}>
                    {new Date(r.created_at).toLocaleString('pl-PL')}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) =>
                    updateStatus(r.id, e.target.value as RequestStatus)
                  }
                  className="text-sm rounded px-2 py-1 border"
                  style={{ backgroundColor: '#131316', borderColor: '#2a2a31', color: '#f4f4f5' }}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm space-y-1" style={{ color: '#a1a1aa' }}>
                <p>
                  {r.length_mb} mb × {r.height_cm} cm —{' '}
                  {MATERIAL_LABELS[r.material]}, {FINISH_LABELS[r.finish]},{' '}
                  {STYLE_LABELS[r.style]}
                </p>
                {r.estimated_price_min && (
                  <p className="text-accent-500 font-semibold">
                    {r.estimated_price_min} – {r.estimated_price_max} zł
                  </p>
                )}
                {r.contact_phone && (
                  <p>
                    Tel:{' '}
                    <a href={`tel:${r.contact_phone}`} className="underline">
                      {r.contact_phone}
                    </a>
                  </p>
                )}
                {r.contact_email && (
                  <p>
                    Email:{' '}
                    <a href={`mailto:${r.contact_email}`} className="underline">
                      {r.contact_email}
                    </a>
                  </p>
                )}
                {r.notes && <p className="italic">„{r.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div
          className="rounded-lg p-5 border space-y-4"
          style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
        >
          <h2 className="text-lg font-semibold text-white">Stawki cennika</h2>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Stal czarna (zł/kg)
            </label>
            <input
              type="number"
              value={priceSteelBlack}
              onChange={(e) => setPriceSteelBlack(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-white border"
              style={{ backgroundColor: '#131316', borderColor: '#2a2a31' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Stal nierdzewna / inox (zł/kg)
            </label>
            <input
              type="number"
              value={priceSteelInox}
              onChange={(e) => setPriceSteelInox(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-white border"
              style={{ backgroundColor: '#131316', borderColor: '#2a2a31' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Aluminium (zł/kg)
            </label>
            <input
              type="number"
              value={priceAluminum}
              onChange={(e) => setPriceAluminum(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-white border"
              style={{ backgroundColor: '#131316', borderColor: '#2a2a31' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Robocizna (zł/mb)
            </label>
            <input
              type="number"
              value={laborPrice}
              onChange={(e) => setLaborPrice(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-white border"
              style={{ backgroundColor: '#131316', borderColor: '#2a2a31' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Marża (%)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-white border"
              style={{ backgroundColor: '#131316', borderColor: '#2a2a31' }}
            />
          </div>

          <button
            onClick={saveSettings}
            className="w-full bg-accent-500 text-white font-semibold py-3 rounded-lg"
          >
            Zapisz zmiany
          </button>
          {savedMsg && (
            <p className="text-center text-sm" style={{ color: '#22c55e' }}>
              Zapisano ✓
            </p>
          )}
        </div>
      )}
    </main>
  );
}
