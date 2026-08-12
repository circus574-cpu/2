import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen blueprint-grid flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-lg space-y-6">
        <p className="font-mono-tech text-ember-500 text-xs tracking-widest uppercase">
          // Konfigurator wycen
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-forge-50" style={{ color: '#f0e4d8' }}>
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
          <svg viewBox="0 0 260 70" className="w-full h-16">
            <line x1="15" y1="50" x2="245" y2="50" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="15" y1="10" x2="15" y2="55" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="70" y1="10" x2="70" y2="55" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="125" y1="10" x2="125" y2="55" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="180" y1="10" x2="180" y2="55" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="245" y1="10" x2="245" y2="55" stroke="#8a8178" strokeWidth="1.2" />
            <line x1="10" y1="5" x2="250" y2="5" stroke="#ff5722" strokeWidth="1.2" />
            <path d="M10 2 L10 8 M250 2 L250 8" stroke="#ff5722" strokeWidth="1.2" />
            <text x="105" y="2" fill="#ff5722" fontFamily="JetBrains Mono" fontSize="8">
              5.0 mb
            </text>
          </svg>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#8a8178' }}>
            Wymiary → cena. W czasie rzeczywistym.
          </p>
        </div>

        <div className="pt-2">
          <Link
            hr