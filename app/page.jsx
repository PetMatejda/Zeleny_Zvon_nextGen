import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            alt="Dense green forest leaves seen from above, creating a lush natural texture"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQZLusAjMNQWKmwchHFjw-jEYwQoDL0tLKwkU1OnG3uzBAw9OfG2D5oS_xNTWzJwq8GJintIyyke2oNVKaRT-NcjtFec0UOUAMffWnX__BlvLaogxdY_Hezc3oy_ofapCo0XfnnLWnv7GAKA1at8XKIconWSTEVaoclVRvj5WXEIrF5e-yw3_8a_NUFFzfrdDyFooejxUC9eQROrrIFNkmF7ccFBRhVSOWYfZ9irpnTrEOC4OJgr6o2nouS9vCQocqwrO0iKXO19w"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/60 via-primary-container/20 to-transparent"></div>
        </div>
        <div className="container max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="text-secondary-fixed font-label tracking-[0.3em] uppercase text-xs font-bold mb-6 block hero-text-shadow">Domácí holistické studio & E-shop</span>
            <h1 className="font-headline text-5xl md:text-7xl text-white mb-8 leading-[1.1] hero-text-shadow tracking-tight">Cesta ke spokojenému životu.</h1>
            <p className="text-white/90 mb-12 text-xl md:text-2xl font-light leading-relaxed max-w-xl hero-text-shadow italic">
              Nabízím podporu a péči na Vaší cestě ke spokojenému a vědomému životu. Pomoc s překonáním náročných životních zkušeností.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link href="/services" className="bg-primary-container text-on-primary px-10 py-4 rounded-lg font-semibold tracking-wide transition-all hover:shadow-2xl hover:brightness-110 active:scale-95 inline-block">
                Rezervovat služby
              </Link>
              <Link href="/eshop" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-lg font-semibold tracking-wide transition-all hover:bg-white/20 active:scale-95 inline-block">
                Prohlédnout e-shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Úvodní Sekce */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-xl">
                <img className="w-full h-full object-cover" alt="Petra Matějíčková" src="https://be43f77103.clvaw-cdnwnd.com/7e020fcf408e821cb2e88418c25b9f42/200004532-b1326b132a/9X6A9899%20kopie%202-001px.jpeg?ph=be43f77103" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary-container rounded-full flex items-center justify-center p-6 text-center animate-pulse">
                <p className="font-headline italic text-on-secondary-container text-sm">&quot;Moje 3R:<br />RESPEKT, RADOST, REZONANCE.&quot;</p>
              </div>
            </div>
            <div>
              <span className="text-secondary font-label tracking-widest uppercase text-xs font-bold mb-4 block">Vítejte</span>
              <h2 className="font-headline text-4xl text-on-surface mb-8">Zelený Zvon</h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed">
                <p>Využívám citlivé a zároveň efektivní metody práce s myslí a tělem, které spojují tradiční znalosti a aktuální poznatky vědy.</p>
                <p>Pomohu Vám propojit hlavu s prožíváním těla, objevit jejich vzájemný vztah a komunikaci na cestě ke zdraví. S všímavostí a laskavostí. Přináším inspiraci, celostní přístup i hlubokou osobní zkušenost.</p>
                <p>Mám úctu k moudrosti Vašeho těla a respektuji Vaše hranice. Naslouchám hlasu Vašeho srdce a duše...</p>
              </div>
              <div className="mt-10">
                <p className="font-headline italic text-xl text-primary-container">Petra Matějíčková</p>
                <p className="text-sm text-outline">Zakladatelka &amp; Terapeutka</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* S čím vám můžeme pomoci? */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-label tracking-widest uppercase text-xs font-bold mb-4 block">Vaše pohoda</span>
            <h2 className="font-headline text-4xl text-on-surface mb-6">S čím vám můžeme pomoci?</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto italic font-light">Cesta k rovnováze začíná přiznáním si vlastních potřeb. Jsme tu, abychom vás vyslechli a podpořili těmi nejjemnějšími metodami.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/services#spánek" className="group block p-10 rounded-2xl bg-surface-container-low transition-all duration-500 hover:bg-secondary-fixed-dim hover:shadow-2xl">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-8 shadow-sm"><span className="material-symbols-outlined text-secondary">bedtime</span></div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Nemůžete spát?</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Dlouhé noci plné myšlenek vyčerpávají tělo i ducha. Naše Bachovy esence pro klidný spánek jemně připraví vaši mysl na regeneraci.</p>
              <span className="text-secondary font-medium text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Více informací <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
            </Link>
            <Link href="/services#tre" className="group block p-10 rounded-2xl bg-surface-container-low transition-all duration-500 hover:bg-primary-fixed hover:shadow-2xl">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-8 shadow-sm"><span className="material-symbols-outlined text-on-primary-fixed-variant">compress</span></div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Cítíte se pod tlakem?</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Chronický stres se ukládá v těle jako napětí. Metoda TRE vám umožní toto napětí bezpečně a přirozeně vytřást a uvolnit.</p>
              <span className="text-on-primary-fixed-variant font-medium text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Více informací <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
            </Link>
            <Link href="/eshop" className="group block p-10 rounded-2xl bg-surface-container-low transition-all duration-500 hover:bg-secondary-container hover:shadow-2xl">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-8 shadow-sm"><span className="material-symbols-outlined text-on-secondary-container">bolt</span></div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Chybí vám energie?</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Cítíte se prázdní a bez chuti do života? Naše speciálně míchané Aura spreje vás okamžitě osvěží a navrátí vám životní jiskru.</p>
              <span className="text-on-secondary-container font-medium text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Více informací <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
            </Link>
            <Link href="/services#psych-k" className="group block p-10 rounded-2xl bg-surface-container-low transition-all duration-500 hover:bg-surface-variant hover:shadow-2xl">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-8 shadow-sm"><span className="material-symbols-outlined text-outline">spa</span></div>
              <h3 className="font-headline text-xl mb-4 text-on-surface">Hledáte vnitřní klid?</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Emoční rozbouřenost nám brání vidět cestu před sebou. Holistická terapie vám pomůže najít střed a tichou sílu uvnitř vás.</p>
              <span className="text-on-surface-variant font-medium text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Více informací <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Služby Studia */}
      <section className="py-24 bg-surface-container-low" id="sluzby">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl mb-4">Služby našeho studia</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Holistické metody pro uvolnění napětí, zpracování emocí a posílení těla.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: 'waves', title: 'Metoda TRE', desc: 'Cvičení pro uvolnění hlubokého svalového napětí a stresu z těla.', bg: 'bg-primary-fixed', iconColor: 'text-on-primary-fixed-variant' },
              { icon: 'psychology', title: 'Psych-K', desc: 'Efektivní cesta k přepsání omezujících přesvědčení ve vaší mysli.', bg: 'bg-secondary-fixed', iconColor: 'text-on-secondary-fixed-variant' },
              { icon: 'eco', title: 'Bachovy esence', desc: 'Přírodní harmonizace emocí pomocí květových esencí na míru.', bg: 'bg-primary-fixed', iconColor: 'text-on-primary-fixed-variant' },
              { icon: 'self_improvement', title: 'Pilates', desc: 'Vědomý pohyb pro pevné a zdravé tělo v komorním prostředí.', bg: 'bg-secondary-fixed', iconColor: 'text-on-secondary-fixed-variant' },
            ].map((s, i) => (
              <div key={i} className={`bg-surface-container-lowest p-8 rounded-xl transition-all hover:shadow-2xl hover:-translate-y-1 ${i % 2 !== 0 ? 'md:translate-y-8' : ''}`}>
                <div className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center mb-6`}>
                  <span className={`material-symbols-outlined ${s.iconColor}`}>{s.icon}</span>
                </div>
                <h3 className="font-headline text-xl mb-3">{s.title}</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{s.desc}</p>
                <Link href="/services" className="text-secondary font-medium text-sm flex items-center gap-2 hover:underline">Více informací <span className="material-symbols-outlined text-xs">arrow_forward</span></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Aktuality */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="font-headline text-4xl mb-12 text-center">Nové události a inspirace</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-surface rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-xl">
              <div className="md:w-1/2 overflow-hidden">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="zen meditation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfZEIjZ_FjcoqrzCRahAkZSAUOo9EuxM52xjSXvbVKnrs3AMLQ-EEY2LBatJPohvw4hdDUWkCFopRBrJi7aZGn5WWLshsKr5NzZol5Vaw5a9lCf0jqast3qhRojtg5ByXYHcPN2_5DVA6lfpHShm8vot4Yp1zJbjdwCrEVMFGE0MNo29dP4QybcCrJaMRtbhjqTrsd673bNguRORYbDM-PPUhNN1eCGE50AfIzFHWgmrmR4TQYli3-F-9oz-Eamt4hNstoHhp-d8U" />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col justify-center">
                <span className="text-secondary font-label text-xs font-bold mb-4">Workshop | 15. Května</span>
                <h3 className="font-headline text-2xl mb-4">Víkendový retreat: Cesta k sobě</h3>
                <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">Intenzivní prožitek kombinující TRE cvičení, meditaci a individuální konzultace.</p>
                <button className="self-start text-on-surface border-b border-on-surface pb-1 font-medium hover:text-secondary hover:border-secondary transition-all">Rezervovat místo</button>
              </div>
            </div>
            <div className="bg-primary-container p-10 rounded-xl flex flex-col justify-between text-on-primary">
              <div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-6">Novinka</span>
                <h3 className="font-headline text-2xl mb-4">Nový online kurz TRE</h3>
                <p className="text-primary-fixed/80 text-sm mb-8 leading-relaxed">Naučte se pracovat se svým tělem z pohodlí domova. Startujeme v červnu.</p>
              </div>
              <Link href="/services" className="w-full bg-surface-container-lowest text-primary-container py-3 rounded-lg font-medium hover:bg-secondary-container hover:text-on-secondary-container transition-all text-center inline-block">Více o kurzu</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
