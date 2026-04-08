import React from 'react';
import { useParams, Link } from 'react-router-dom';

const allServices = {
  'tre': { 
    title: 'TRE®', 
    subtitle: 'Tension, Stress & Trauma Release Exercises',
    desc: 'Metoda TRE® je inovativní série cvičení, která asistuje tělu při uvolňování hlubokých svalových vzorců napětí, stresu a traumatu. Je založena na faktu, že stres a trauma mají fyzickou podstatu - jsou zapsány i v napětí svalů.',
    benefits: ['Uvolnění chronického napětí', 'Snížení pocitu stresu a úzkosti', 'Zvýšení energie a odolnosti', 'Lepší spánek']
  },
  'psych-k': { 
    title: 'PSYCH-K®', 
    subtitle: 'Změna podvědomých přesvědčení',
    desc: 'Unikátní způsob práce s myslí a přesvědčeními, která Vám možná brání v dosažení zdraví, pohody, klidných vztahů. Jde o způsob jak efektivně přepisovat limitující programy vašeho podvědomí do podpůrných afirmací.',
    benefits: ['Odstranění vnitřních odporů', 'Rychlá a trvalá pozitivní změna', 'Snížení strachů a fobií', 'Vyšší pocit osobní síly a kompetence']
  },
  'bach': { 
    title: 'Bachovy Esence', 
    subtitle: 'Jemná harmonie z přírody',
    desc: 'Dr. Edward Bach objevil ve 30 letech 20. století 38 květových esencí pro zvládání běžných emocionálních stavů, od strachu k nejistotě přes pocit opuštěnosti, beznaděje či stresu. Společně připravíme lahvičku přímo na míru Vaší momentální situaci.',
    benefits: ['Získání vnitřního klidu', 'Úleva od šoku či krizí', 'Přírodní zcela bezpečná metoda', 'Vhodné i pro děti a zvířata']
  },
  'pilates': { 
    title: 'Pilates Clinic', 
    subtitle: 'Rozhýbejte svůj střed',
    desc: 'Pohybová metoda navržená tak, aby posílila a stabilizovala tělo beze stresu přesahováním a ničením kloubů. Cvičení vede k posílení hlubokého stabilizačního systému, takzvaného "Core". V Zeleném zvonu poskytuji výhradně individuální či semi-individuální lekce.',
    benefits: ['Cvičení na podložce a Reformeru', 'Odstranění bolestí zad', 'Správné dýchání', 'Zvýšení kloubní flexibility']
  },
  'joga': { 
    title: 'Kundalini Jóga', 
    subtitle: 'Jóga vědomí',
    desc: 'Spojuje fyzické posturální cviky (ásany), dynamické dýchací techniky (pranajáma), meditace a zpívání manter (zvukové vibrace). Působí rychle a účinně na uvolnění nervového a imunitního systému.',
    benefits: ['Proudění energie', 'Práce s dechem a myslí', 'Probudí kreativitu', 'Pocit absolutního vnitřního naplnění']
  }
};

export default function ServiceDetailPage() {
  const { id } = useParams();
  const service = allServices[id];

  if (!service) {
    return (
      <div className="container section-padding" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Služba nebyla nalezena.</h1>
        <Link to="/sluzby" className="btn-primary">Zpět na služby</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="page-header" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <span className="chip" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.5rem' }}>Detail Služby</span>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>{service.title}</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--on-surface-variant)', maxWidth: '800px' }}>
            {service.subtitle}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid grid-cols-2" style={{ gap: '4rem' }}>
          <div>
            <p style={{ color: 'var(--on-surface)', fontSize: '1.25rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              {service.desc}
            </p>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Hlavní benefity:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {service.benefits.map((b, idx) => (
                <li key={idx} style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative', fontSize: '1.1rem' }}>
                  <span style={{ position: 'absolute', left: 0, top: '4px', width: '24px', height: '24px', background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '3rem' }}>
              <Link to="/kontakt" className="btn-primary" style={{ display: 'inline-block', marginRight: '1rem' }}>Rezervovat konzultaci</Link>
              <Link to="/sluzby" style={{ color: 'var(--on-surface-variant)', textDecoration: 'underline' }}>Zpět na přehled</Link>
            </div>
          </div>
          
          <div>
            <div className="card shadow-ambient" style={{ background: 'var(--surface-container-highest)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', fontStyle: 'italic' }}>
                 "Probouzí životní energii a uvolňuje blokády."
               </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
