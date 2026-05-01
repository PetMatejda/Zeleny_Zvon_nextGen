import Link from 'next/link';

const allServices = {
  'tre': {
    title: 'TRE®',
    subtitle: 'Tension, Stress & Trauma Release Exercises',
    desc: 'Metoda TRE® je inovativní série cvičení, která asistuje tělu při uvolňování hlubokých svalových vzorců napětí, stresu a traumatu.',
    benefits: ['Uvolnění chronického napětí', 'Snížení pocitu stresu a úzkosti', 'Zvýšení energie a odolnosti', 'Lepší spánek']
  },
  'psych-k': {
    title: 'PSYCH-K®',
    subtitle: 'Změna podvědomých přesvědčení',
    desc: 'Unikátní způsob práce s myslí a přesvědčeními, která Vám možná brání v dosažení zdraví, pohody, klidných vztahů.',
    benefits: ['Odstranění vnitřních odporů', 'Rychlá a trvalá pozitivní změna', 'Snížení strachů a fobií', 'Vyšší pocit osobní síly a kompetence']
  },
  'bach': {
    title: 'Bachovy Esence',
    subtitle: 'Jemná harmonie z přírody',
    desc: 'Dr. Edward Bach objevil ve 30 letech 20. století 38 květových esencí pro zvládání běžných emocionálních stavů.',
    benefits: ['Získání vnitřního klidu', 'Úleva od šoku či krizí', 'Přírodní zcela bezpečná metoda', 'Vhodné i pro děti a zvířata']
  },
  'pilates': {
    title: 'Pilates Clinic',
    subtitle: 'Rozhýbejte svůj střed',
    desc: 'Pohybová metoda navržená tak, aby posílila a stabilizovala tělo beze stresu. V Zeleném zvonu poskytuji výhradně individuální či semi-individuální lekce.',
    benefits: ['Cvičení na podložce a Reformeru', 'Odstranění bolestí zad', 'Správné dýchání', 'Zvýšení kloubní flexibility']
  },
  'joga': {
    title: 'Kundalini Jóga',
    subtitle: 'Jóga vědomí',
    desc: 'Spojuje fyzické posturální cviky, dynamické dýchací techniky, meditace a zpívání manter. Působí rychle a účinně na uvolnění nervového a imunitního systému.',
    benefits: ['Proudění energie', 'Práce s dechem a myslí', 'Probudí kreativitu', 'Pocit absolutního vnitřního naplnění']
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = allServices[slug];
  if (!service) return { title: 'Služba nenalezena | Zelený Zvon' };
  return {
    title: `${service.title} | Zelený Zvon`,
    description: service.desc,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = allServices[slug];

  if (!service) {
    return (
      <div className="container max-w-7xl mx-auto px-8 py-32 text-center">
        <h1 className="text-4xl font-headline mb-8">Služba nebyla nalezena.</h1>
        <Link href="/services" className="bg-primary-container text-on-primary px-8 py-4 rounded-full font-semibold">Zpět na služby</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-32 font-plusjakarta">
      <div className="mb-16">
        <span className="inline-block py-1 px-4 mb-6 rounded-full bg-secondary-fixed text-on-secondary-fixed text-sm font-semibold tracking-widest uppercase">Detail Služby</span>
        <h1 className="text-5xl font-notoserif mb-4 text-primary-container">{service.title}</h1>
        <p className="text-2xl text-on-surface-variant">{service.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <p className="text-on-surface text-xl leading-relaxed mb-8">{service.desc}</p>
          <h3 className="text-2xl font-notoserif mb-6 text-primary-container">Hlavní benefity:</h3>
          <ul className="space-y-4">
            {service.benefits.map((b, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xs flex-shrink-0">✓</span>
                <span className="text-on-surface">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex gap-4">
            <Link href="/contact" className="bg-primary-container text-on-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all inline-block">Rezervovat konzultaci</Link>
            <Link href="/services" className="text-on-surface-variant underline underline-offset-4 py-4 hover:text-[#765a17] transition-colors">Zpět na přehled</Link>
          </div>
        </div>
        <div className="bg-surface-container-highest rounded-xl min-h-[400px] flex items-center justify-center p-12">
          <p className="text-on-surface-variant text-xl italic text-center">&quot;Probouzí životní energii a uvolňuje blokády.&quot;</p>
        </div>
      </div>
    </div>
  );
}
