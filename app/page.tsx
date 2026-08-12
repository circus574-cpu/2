import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-lg space-y-6">
        <p className="text-accent-500 text-sm font-semibold tracking-wider uppercase">
          Konfigurator wycen
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Wyceń balustradę online w kilka sekund
        </h1>
        <p className="text-steel-600 text-base leading-relaxed" style={{ color: '#a1a1aa' }}>
          Narzędzie dla zakładów spawalniczych i ślusarskich — klient sam
          konfiguruje produkt i od razu widzi orientacyjną cenę, a zapytanie
          trafia prosto do Ciebie.
        </p>

        <div className="pt-4">
          <Link
            href="/z/zaklad-testowy"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Zobacz przykładowy konfigurator →
          </Link>
        </div>

        <p className="text-xs pt-8" style={{ color: '#71717a' }}>
          Panel dla właściciela zakładu: /admin/zaklad-testowy
        </p>
      </div>
    </main>
  );
}