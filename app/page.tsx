import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen blueprint-grid flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-lg space-y-6">
        <p className="font-mono-tech text-ember-500 text-xs tracking-widest uppercase" style={{ color: '#ff5722' }}>
          // Konfigurator wycen
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#f0e4d8' }}>
          Wyceń balustradę<br />online w kilka sekund
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#a89a8c' }}>
          Narzędzie dla zakładów spawalniczych i ślusarskich — klient sam
          konfiguruje produkt i od razu widzi orientacyjną cenę, a zapytanie
          trafia prosto do Ciebie.
        </p>

        <div
          className="rounded-lg p-5 my-2 mx-auto max-w-xs"
          style={{ backgroundColor: 'rgba(33,27,22,0.6)', border: '1px solid #3a2f26' }}
        >
          <svg viewBox="0 0 280 90" className="w-full h-20">
            <line x1="40" y1="70" x2="260" y2="70" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="40" y1="20" x2="40" y2="75" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="260" y1="20" x2="260" y2="75" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="40" y1="15" x2="260" y2="15" stroke="#ff5722" strokeWidth="1.2" />
            <path d="M40 12 L40 18 M260 12 L260 18" stroke="#ff5722" strokeWidth="1.2" />
          </svg>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#8a8178' }}>
            Wymiary → cena. W czasie rzeczywistym.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/z/zaklad-testowy"
            className="ember-btn inline-block font-display font-semibold px-8 py-3 rounded-lg"
            style={{ color: '#161412' }}
          >
            Zobacz przykładowy konfigurator →
          </Link>
        </div>

        <p className="font-mono-tech text-xs pt-8" style={{ color: '#8a8178' }}>
          Panel dla właściciela zakładu: /admin/zaklad-testowy
        </p>
      </div>
    </main>
  );
}