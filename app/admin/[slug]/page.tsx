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

const CARD_BG = '#211b16';
const CARD_BORDER = '#3a2f26';
const INPUT_BG = '#1c1712';
const TEXT_MUTED = '#a89a8c';
const TEXT_FAINT = '#8a8178';
const EMBER = '#ff5722';

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [requests, setRequests] = useState<ConfiguratorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'settings'>('requests');
  const [savedMsg, setSavedMsg] = useState(false);

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
        <p style={{ color: TEXT_MUTED }}>Ładowanie…</p>
      </main>
    );
  }

  if (!workshop) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p style={{ color: TEXT_MUTED }}>Nie znaleziono zakładu.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen blueprint-grid px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold mb-6" style={{ color: '#f0e4d8' }}>
        {workshop.name}
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('requests')}
          className="font-display px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: tab === 'requests' ? EMBER : CARD_BG,
            color: tab === 'requests' ? '#161412' : TEXT_MUTED,
          }}
        >
          Zapytania ({requests.length})
        </button>
        <button
          onClick={() => setTab('settings')}
          className="font-display px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: tab === 'settings' ? EMBER : CARD_BG,
            color: tab === 'settings' ? '#161412' : TEXT_MUTED,
          }}
        >
          Ustawienia cennika
        </button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 && (
            <p style={{ color: TEXT_FAINT }}>Brak zapytań.</p>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-lg p-4"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-display font-semibold" style={{ color: '#f0e4d8' }}>
                    {r.contact_name || 'Bez nazwy'}
                  </p>
                  <p className="font-mono-tech text-xs" style={{ color: TEXT_FAINT }}>
                    {new Date(r.created_at).toLocaleString('pl-PL')}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) =>
                    updateStatus(r.id, e.target.value as RequestStatus)
                  }
                  className="text-sm rounded px-2 py-1"
                  style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm space-y-1" style={{ color: TEXT_MUTED }}>
                <p>
                  {r.length_mb} mb × {r.height_cm} cm —{' '}
                  {MATERIAL_LABELS[r.material]}, {FINISH_LABELS[r.finish]},{' '}
                  {STYLE_LABELS[r.style]}, {r.profile_shape === 'square' ? 'profil kwadratowy' : 'profil prostokątny'}
                </p>
                {r.estimated_price_min && (
                  <p className="ember-text font-display font-semibold">
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
          className="rounded-lg p-5 space-y-4"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>
            Stawki cennika
          </h2>

          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Stal czarna (zł/kg)
            </label>
            <input
              type="number"
              value={priceSteelBlack}
              onChange={(e) => setPriceSteelBlack(e.target.value)}
              className="font-mono-tech w-full rounded-lg px-4 py-2"
              style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Stal nierdzewna / inox (zł/kg)
            </label>
            <input
              type="number"
              value={priceSteelInox}
              onChange={(e) => setPriceSteelInox(e.target.value)}
              className="font-mono-tech w-full rounded-lg px-4 py-2"
              style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Aluminium (zł/kg)
            </label>
            <input
              type="number"
              value={priceAluminum}
              onChange={(e) => setPriceAluminum(e.target.value)}
              className="font-mono-tech w-full rounded-lg px-4 py-2"
              style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Robocizna (zł/mb)
            </label>
            <input
              type="number"
              value={laborPrice}
              onChange={(e) => setLaborPrice(e.target.value)}
              className="font-mono-tech w-full rounded-lg px-4 py-2"
              style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Marża (%)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="font-mono-tech w-full rounded-lg px-4 py-2"
              style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
            />
          </div>

          <button
            onClick={saveSettings}
            className="ember-btn w-full font-display font-semibold py-3 rounded-lg"
            style={{ color: '#161412' }}
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