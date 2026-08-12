'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Workshop, Material, Finish, Style, ProfileShape } from '@/lib/supabase';
import {
  calculatePrice,
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
  PROFILE_LABELS,
} from '@/lib/pricing';

type Step = 'dimensions' | 'material' | 'profile' | 'finish' | 'style' | 'contact' | 'done';
const STEP_ORDER: Step[] = ['dimensions', 'material', 'profile', 'finish', 'style', 'contact'];

const CARD_BG = '#211b16';
const CARD_BORDER = '#3a2f26';
const INPUT_BG = '#1c1712';
const TEXT_MUTED = '#a89a8c';
const TEXT_FAINT = '#8a8178';
const EMBER = '#ff5722';

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
  const [profileShape, setProfileShape] = useState<ProfileShape | null>(null);
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
    if (!workshop || !lengthMb || !material || !style || !profileShape) return null;
    const len = parseFloat(lengthMb);
    if (isNaN(len) || len <= 0) return null;
    return calculatePrice(workshop, len, material, style, profileShape);
  }, [workshop, lengthMb, material, style, profileShape]);

  async function handleSubmit() {
    if (!workshop || !price || !profileShape) return;
    setSubmitting(true);

    const { error } = await supabase.from('configurator_requests').insert({
      workshop_id: workshop.id,
      length_mb: parseFloat(lengthMb),
      height_cm: parseFloat(heightCm),
      material,
      finish,
      style,
      profile_shape: profileShape,
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
        <p style={{ color: TEXT_MUTED }}>Ładowanie…</p>
      </main>
    );
  }

  if (notFound || !workshop) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p style={{ color: TEXT_MUTED }}>
          Nie znaleziono konfiguratora dla tego zakładu.
        </p>
      </main>
    );
  }

  const lenDisplay = lengthMb ? parseFloat(lengthMb).toFixed(1) : '—';
  const heightDisplay = heightCm ? heightCm : '—';

  return (
    <main className="min-h-screen blueprint-grid px-6 py-10 max-w-md mx-auto">
      <header className="mb-8">
        <p className="font-mono-tech text-xs" style={{ color: EMBER }}>
          // {workshop.name}
        </p>
        <h1 className="font-display text-2xl font-bold mt-1" style={{ color: '#f0e4d8' }}>
          Konfigurator balustrady
        </h1>
      </header>

      {step !== 'done' && (
        <div className="flex gap-2 mb-8">
          {STEP_ORDER.map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{
                backgroundColor:
                  s === step || STEP_ORDER.indexOf(s) < STEP_ORDER.indexOf(step)
                    ? EMBER
                    : CARD_BORDER,
              }}
            />
          ))}
        </div>
      )}

      {step === 'dimensions' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>
            Wymiary balustrady
          </h2>

          <div className="rounded-lg p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <svg viewBox="0 0 280 90" className="w-full h-20">
              <line x1="40" y1="70" x2="260" y2="70" stroke={TEXT_FAINT} strokeWidth="1.2" />
              <line x1="40" y1="20" x2="40" y2="75" stroke={TEXT_FAINT} strokeWidth="1.2" />
              <line x1="260" y1="20" x2="260" y2="75" stroke={TEXT_FAINT} strokeWidth="1.2" />
              <line x1="40" y1="15" x2="260" y2="15" stroke={EMBER} strokeWidth="1.2" />
              <path d="M40 12 L40 18 M260 12 L260 18" stroke={EMBER} strokeWidth="1.2" />
              <line x1="15" y1="20" x2="15" y2="70" stroke={EMBER} strokeWidth="1.2" />
              <path d="M12 20 L18 20 M12 70 L18 70" stroke={EMBER} strokeWidth="1.2" />
            </svg>
            <div className="flex justify-between font-mono-tech text-xs mt-2" style={{ color: EMBER }}>
              <span>Wysokość: {heightDisplay} cm</span>
              <span>Długość: {lenDisplay} mb</span>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Długość (mb)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={lengthMb}
              onChange={(e) => setLengthMb(e.target.value)}
              placeholder="np. 5"
              className="font-mono-tech w-full rounded-lg px-4 py-3"
              style={{ backgroundColor: INPUT_BG, borderColor: CARD_BORDER, border: '1px solid', color: '#f0e4d8' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: TEXT_MUTED }}>
              Wysokość (cm)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="np. 110"
              className="font-mono-tech w-full rounded-lg px-4 py-3"
              style={{ backgroundColor: INPUT_BG, borderColor: CARD_BORDER, border: '1px solid', color: '#f0e4d8' }}
            />
          </div>
          <button
            disabled={!lengthMb || !heightCm}
            onClick={() => setStep('material')}
            className="ember-btn w-full disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
            style={{ color: '#161412' }}
          >
            Dalej
          </button>
        </div>
      )}

      {step === 'material' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>Materiał</h2>
          {(Object.keys(MATERIAL_LABELS) as Material[]).map((m) => (
            <button
              key={m}
              onClick={() => setMaterial(m)}
              className="w-full text-left rounded-lg px-4 py-3 font-display"
              style={{
                backgroundColor: material === m ? EMBER : CARD_BG,
                border: `1px solid ${material === m ? EMBER : CARD_BORDER}`,
                color: material === m ? '#161412' : '#f0e4d8',
              }}
            >
              {MATERIAL_LABELS[m]}
            </button>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('dimensions')}
              className="flex-1 py-3 rounded-lg"
              style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
            >
              Wstecz
            </button>
            <button
              disabled={!material}
              onClick={() => setStep('profile')}
              className="ember-btn flex-1 disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
              style={{ color: '#161412' }}
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'profile' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>Profil</h2>
          {(Object.keys(PROFILE_LABELS) as ProfileShape[]).map((p) => (
            <button
              key={p}
              onClick={() => setProfileShape(p)}
              className="w-full text-left rounded-lg px-4 py-3 font-display"
              style={{
                backgroundColor: profileShape === p ? EMBER : CARD_BG,
                border: `1px solid ${profileShape === p ? EMBER : CARD_BORDER}`,
                color: profileShape === p ? '#161412' : '#f0e4d8',
              }}
            >
              {PROFILE_LABELS[p]}
            </button>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('material')}
              className="flex-1 py-3 rounded-lg"
              style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
            >
              Wstecz
            </button>
            <button
              disabled={!profileShape}
              onClick={() => setStep('finish')}
              className="ember-btn flex-1 disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
              style={{ color: '#161412' }}
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'finish' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>Wykończenie</h2>
          {(Object.keys(FINISH_LABELS) as Finish[]).map((f) => (
            <button
              key={f}
              onClick={() => setFinish(f)}
              className="w-full text-left rounded-lg px-4 py-3 font-display"
              style={{
                backgroundColor: finish === f ? EMBER : CARD_BG,
                border: `1px solid ${finish === f ? EMBER : CARD_BORDER}`,
                color: finish === f ? '#161412' : '#f0e4d8',
              }}
            >
              {FINISH_LABELS[f]}
            </button>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('profile')}
              className="flex-1 py-3 rounded-lg"
              style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
            >
              Wstecz
            </button>
            <button
              disabled={!finish}
              onClick={() => setStep('style')}
              className="ember-btn flex-1 disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
              style={{ color: '#161412' }}
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'style' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>Styl wypełnienia</h2>
          {(Object.keys(STYLE_LABELS) as Style[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className="w-full text-left rounded-lg px-4 py-3 font-display"
              style={{
                backgroundColor: style === s ? EMBER : CARD_BG,
                border: `1px solid ${style === s ? EMBER : CARD_BORDER}`,
                color: style === s ? '#161412' : '#f0e4d8',
              }}
            >
              {STYLE_LABELS[s]}
            </button>
          ))}

          {price && (
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <p className="font-mono-tech text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                Szacunkowa wycena
              </p>
              <p className="ember-text font-display text-xl font-bold mt-1">
                {price.min} zł – {price.max} zł
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('finish')}
              className="flex-1 py-3 rounded-lg"
              style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
            >
              Wstecz
            </button>
            <button
              disabled={!style}
              onClick={() => setStep('contact')}
              className="ember-btn flex-1 disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
              style={{ color: '#161412' }}
            >
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === 'contact' && (
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold" style={{ color: '#f0e4d8' }}>Dane kontaktowe</h2>

          {price && (
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <p className="font-mono-tech text-xs uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                Szacunkowa wycena
              </p>
              <p className="ember-text font-display text-xl font-bold mt-1">
                {price.min} zł – {price.max} zł
              </p>
              <p className="text-xs mt-1" style={{ color: TEXT_FAINT }}>
                Wartość orientacyjna. Ostateczną cenę potwierdza zakład po kontakcie.
              </p>
            </div>
          )}

          <input
            type="text"
            placeholder="Imię i nazwisko *"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg px-4 py-3"
            style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
          />
          <input
            type="tel"
            placeholder="Telefon *"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-lg px-4 py-3"
            style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
          />
          <input
            type="email"
            placeholder="E-mail (opcjonalnie)"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-3"
            style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
          />
          <textarea
            placeholder="Uwagi (opcjonalnie)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg px-4 py-3"
            style={{ backgroundColor: INPUT_BG, border: `1px solid ${CARD_BORDER}`, color: '#f0e4d8' }}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep('style')}
              className="flex-1 py-3 rounded-lg"
              style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}
            >
              Wstecz
            </button>
            <button
              disabled={!contactName || !contactPhone || submitting}
              onClick={handleSubmit}
              className="ember-btn flex-1 disabled:opacity-30 font-display font-semibold py-3 rounded-lg"
              style={{ color: '#161412' }}
            >
              {submitting ? 'Wysyłanie…' : 'Wyślij zapytanie'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-12 space-y-4">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#f0e4d8' }}>Dziękujemy!</h2>
          <p style={{ color: TEXT_MUTED }}>
            Twoje zapytanie trafiło do zakładu {workshop.name}. Skontaktujemy
            się wkrótce, aby potwierdzić szczegóły i ostateczną wycenę.
          </p>
          {price && (
            <p className="ember-text font-display font-semibold">
              Orientacyjna wycena: {price.min}–{price.max} zł
            </p>
          )}
        </div>
      )}
    </main>
  );
} 