'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Workshop, Material, Finish, Style } from '@/lib/supabase';
import {
  calculatePrice,
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
} from '@/lib/pricing';

type Step = 'dimensions' | 'material' | 'finish' | 'style' | 'contact' | 'done';

export default function ConfiguratorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<Step>('dimensions');
  const [lengthMb, setLengthMb] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [material, setMaterial] = useState<Material | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadWorkshop() {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setWorkshop(data);
      }
      setLoading(false);
    }
    loadWorkshop();
  }, [slug]);

  const price = useMemo(() => {
    if (!workshop || !lengthMb || !material || !style) return null;
    const len = parseFloat(lengthMb);
    if (isNaN(len) || len <= 0) return null;
    return calculatePrice(workshop, len, material, style);
  }, [workshop, lengthMb, material, style]);

  async function handleSubmit() {
    if (!workshop || !price) return;
    setSubmitting(true);

    const { error } = await supabase.from('configurator_requests').insert({
      workshop_id: workshop.id,
      length_mb: parseFloat(lengthMb),
      height_cm: parseFloat(heightCm),
      material,
      finish,
      style,
      estimated_price_min: price.min,
      estimated_price_max: price.max,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
      notes: notes || null,
      status: 'new',
    });

    setSubmitting(false);
    if (!error) {
      setStep('done');
    } else {
      alert('Wystąpił błąd. Spróbuj ponownie.');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: '#a1a1aa' }}>Ładowanie…</p>
      </main>
    );
  }

  if (notFound || !workshop) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p style={{ color: '#a1a1aa' }}>
          Nie znaleziono konfiguratora dla tego zakładu.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto">
      <header className="mb-8">
        <p className="text-accent-500 text-xs font-semibold uppercase tracking-wider">
          {workshop.name}
        </p>
        <h1 className="text-2xl font-bold text-white mt-1">
          Konfigurator balustrady
        </h1>
      </header>

      {step !== 'done' && (
        <div className="flex gap-2 mb-8">
          {['dimensions', 'material', 'finish', 'style', 'contact'].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{
                backgroundColor:
                  s === step ||
                  ['dimensions', 'material', 'finish', 'style', 'contact'].indexOf(s) <
                    ['dimensions', 'material', 'finish', 'style', 'contact'].indexOf(step)
                    ? '#f97316'
                    : '#2a2a31',
              }}
            />
          ))}
        </div>
      )}

      {step === 'dimensions' && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Wymiary balustrady
          </h2>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Długość (mb)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={lengthMb}
              onChange={(e) => setLengthMb(e.target.value)}
              placeholder="np. 5"
              className="w-full bg-steel-800 border border-steel-700 rounded-lg px-4 py-3 text-white"
              style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#a1a1aa' }}>
              Wysokość (cm)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="np. 110"
              className="w-full rounded-lg px-4 py-3 text-white border"
              style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
            />
          </div>
          <button
            disabled={!lengthMb || !heightCm}
            onClick={() => setStep('material')}
            className="w-full bg-accent-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg"
          >
            Dalej
          </button>
        </div>
      )}

      {step === 'material' && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Materiał</h2>
          {(Object.keys(MATERIAL_LABELS) as Material[]).map((m) => (
            <button
              key={m}
              onClick={() => setMaterial(m)}
              className="w-full text-left rounded-lg px-4 py-3 border"
              style={{
                backgroundColor: material === m ? '#f97316' : '#1c1c21',
                borderColor: material === m ? '#f97316' : '#2a2a31',
                color: material === m ? '#0a0a0b' : '#f4f4f5',
              }}
            >
              {MATERIAL_LABELS[m]}
            </button>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('dimensions')}
              className="flex-1 py-3 rounded-lg border"
              style={{ borderColor: '#2a2a31', color: '#a1a1aa' }}
            >
              Wstecz
            </button>
            <button
              disabled={!material}
              onClick={() => setStep('finish')}
              className="flex-1 bg-accent-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg"
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'finish' && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Wykończenie</h2>
          {(Object.keys(FINISH_LABELS) as Finish[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className="w-full text-left rounded-lg px-4 py-3 border"
              style={{
                backgroundColor: finish === f ? '#f97316' : '#1c1c21',
                borderColor: finish === f ? '#f97316' : '#2a2a31',
                color: finish === f ? '#0a0a0b' : '#f4f4f5',
              }}
            >
              {FINISH_LABELS[f]}
            </button>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('material')}
              className="flex-1 py-3 rounded-lg border"
              style={{ borderColor: '#2a2a31', color: '#a1a1aa' }}
            >
              Wstecz
            </button>
            <button
              disabled={!finish}
              onClick={() => setStep('style')}
              className="flex-1 bg-accent-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg"
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'style' && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Styl wypełnienia</h2>
          {(Object.keys(STYLE_LABELS) as Style[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className="w-full text-left rounded-lg px-4 py-3 border"
              style={{
                backgroundColor: style === s ? '#f97316' : '#1c1c21',
                borderColor: style === s ? '#f97316' : '#2a2a31',
                color: style === s ? '#0a0a0b' : '#f4f4f5',
              }}
            >
              {STYLE_LABELS[s]}
            </button>
          ))}

          {price && (
            <div
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: '#1c1c21' }}
            >
              <p className="text-xs uppercase tracking-wide" style={{ color: '#a1a1aa' }}>
                Szacunkowa wycena
              </p>
              <p className="text-xl font-bold text-accent-500 mt-1">
                {price.min} zł – {price.max} zł
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('finish')}
              className="flex-1 py-3 rounded-lg border"
              style={{ borderColor: '#2a2a31', color: '#a1a1aa' }}
            >
              Wstecz
            </button>
            <button
              disabled={!style}
              onClick={() => setStep('contact')}
              className="flex-1 bg-accent-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg"
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'contact' && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-white">Dane kontaktowe</h2>

          {price && (
            <div
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: '#1c1c21' }}
            >
              <p className="text-xs uppercase tracking-wide" style={{ color: '#a1a1aa' }}>
                Szacunkowa wycena
              </p>
              <p className="text-xl font-bold text-accent-500 mt-1">
                {price.min} zł – {price.max} zł
              </p>
              <p className="text-xs mt-1" style={{ color: '#71717a' }}>
                Wartość orientacyjna. Ostateczną cenę potwierdza zakład po kontakcie.
              </p>
            </div>
          )}

          <input
            type="text"
            placeholder="Imię i nazwisko *"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 text-white border"
            style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
          />
          <input
            type="tel"
            placeholder="Telefon *"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-lg px-4 py-3 text-white border"
            style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
          />
          <input
            type="email"
            placeholder="E-mail (opcjonalnie)"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-3 text-white border"
            style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
          />
          <textarea
            placeholder="Uwagi (opcjonalnie)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg px-4 py-3 text-white border"
            style={{ backgroundColor: '#1c1c21', borderColor: '#2a2a31' }}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep('style')}
              className="flex-1 py-3 rounded-lg border"
              style={{ borderColor: '#2a2a31', color: '#a1a1aa' }}
            >
              Wstecz
            </button>
            <button
              disabled={!contactName || !contactPhone || submitting}
              onClick={handleSubmit}
              className="flex-1 bg-accent-500 disabled:opacity-40 text-white font-semibold py-3 rounded-lg"
            >
              {submitting ? 'Wysyłanie…' : 'Wyślij zapytanie'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold text-white">Dziękujemy!</h2>
          <p style={{ color: '#a1a1aa' }}>
            Twoje zapytanie trafiło do zakładu {workshop.name}. Skontaktujemy
            się wkrótce, aby potwierdzić szczegóły i ostateczną wycenę.
          </p>
          {price && (
            <p className="text-accent-500 font-semibold">
              Orientacyjna wycena: {price.min}–{price.max} zł
            </p>
          )}
        </div>
      )}
    </main>
  );
}
