import Link from 'next/link';

export const metadata = {
  title: 'Naše služby | Zelený Zvon',
  description: 'Holistické terapie pro regulaci nervové soustavy, podvědomé procesy, pohyb a smyslovou péči. TRE, PSYCH-K, Bachovy esence, Pilates.',
};

export default function ServicesPage() {
  return (
    <main className="pt-20 font-plusjakarta">
      {/* Hero Section */}
      <section className="relative h-[819px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Wellness Interior" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7y5o2b0ZDYfQDwN7nHCS2X5rgZZ-RgCXJYjYOSD1ITS7JjBCMbg6HJODkQihMZfPA3Alolz1r7yGbpQfx0_2OvSXBqgdcKjn5btjsCjKjG4q2bZE-xaEPpu8qYcQjaRw3mjWyxY1EzLw5kdRqtDd8BKYxq_hTqh-P2RcHM85A5EYXVsx54l1MO6gn4Rq4GLfR-4cYJZuEtFjRhENsxnXA50Y3lXyautyEc0PlPCl7B_Bexoz7ZnXs1zdjYrLyWc5CXVXzHzCDlqg" />
          <div className="absolute inset-0 bg-primary-container/20 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl bg-surface/90 backdrop-blur-md p-12 rounded-xl shadow-2xl">
            <h1 className="font-headline text-5xl md:text-6xl text-primary-container mb-6 leading-tight">Naše služby</h1>
            <p className="text-lg text-on-surface-variant leading-relaxed font-light">Cesta k vnitřní harmonii začíná u vaší nervové soustavy. Nabízíme holistický přístup, který propojuje tělo, mysl a energetickou rovnováhu pro dosažení trvalé rezilience a klidu.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-24">
        {/* Category 1 */}
        <div className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <h2 className="font-headline text-3xl md:text-4xl text-primary-container">Regulace nervové soustavy</h2>
            <span className="text-[#765a17] dark:text-[#ffdf9f] font-medium tracking-widest uppercase text-xs">Inner Resilience</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container-low p-10 rounded-xl hover:bg-surface-container transition-colors duration-500 group">
              <div className="flex items-start justify-between mb-8">
                <span className="material-symbols-outlined text-4xl text-[#765a17] dark:text-[#ffdf9f]">energy_savings_leaf</span>
                <span className="text-xs font-label text-on-surface-variant opacity-60">60 - 90 min</span>
              </div>
              <h3 className="font-headline text-2xl mb-4 text-on-surface">TRE® (Tension &amp; Trauma Release)</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">Série cvičení, která pomáhají tělu uvolnit hluboké svalové vzorce stresu a napětí aktivací přirozeného reflexního mechanismu chvění.</p>
              <Link href="#" className="inline-flex items-center text-[#765a17] dark:text-[#ffdf9f] font-semibold group-hover:gap-4 transition-all gap-2">Zjistit více <span className="material-symbols-outlined">arrow_forward</span></Link>
            </div>
            <div className="bg-surface-container-low p-10 rounded-xl hover:bg-surface-container transition-colors duration-500 group">
              <div className="flex items-start justify-between mb-8">
                <span className="material-symbols-outlined text-4xl text-[#765a17] dark:text-[#ffdf9f]">psychology_alt</span>
                <span className="text-xs font-label text-on-surface-variant opacity-60">45 - 60 min</span>
              </div>
              <h3 className="font-headline text-2xl mb-4 text-on-surface">EmotionAid®</h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">Nástroje pro okamžitou emoční první pomoc a stabilizaci v náročných situacích, založené na principech Somatic Experiencing®.</p>
              <Link href="#" className="inline-flex items-center text-[#765a17] dark:text-[#ffdf9f] font-semibold group-hover:gap-4 transition-all gap-2">Zjistit více <span className="material-symbols-outlined">arrow_forward</span></Link>
            </div>
          </div>
        </div>

        {/* Category 2 */}
        <div className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span className="text-[#765a17] dark:text-[#ffdf9f] font-medium tracking-widest uppercase text-xs mb-4 block">Mind Transformation</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary-container mb-6">Podvědomé procesy</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-headline text-2xl mb-3 text-on-surface">PSYCH-K®</h3>
                <p className="text-on-surface-variant leading-relaxed">Průlomová metoda pro transformaci omezujících podvědomých přesvědčení na ta, která vás podporují v životě i zdraví.</p>
              </div>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-secondary-fixed rounded-full text-on-secondary-fixed text-xs font-label">Změna vnímání</span>
                <span className="px-4 py-2 bg-secondary-fixed rounded-full text-on-secondary-fixed text-xs font-label">Buněčná paměť</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 rounded-xl overflow-hidden aspect-[16/9]">
            <img alt="Abstract Calm" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa-_cLE5jR7Xa2rOEIDIQWsFg2Mhl-OpfM3PXFZgne_wSaxJqWvhpidwQg1BxIhohgkBty3DvcF7rsj0vrKAUzGOTPXbSqojym0DQ_McWux828lL6X1wTMINMwc6YQCE3d0nS6Djvipc6eun56nbMqkrHLlHlQW5f6-4TSqc6VfysY_W6psEFBu7wr07WHBTBh6QNc37mTOdMvpK4v6HopRdoy2QrOqSPgXVT7w3kyty6CXtQozW2fN-oV9jIRVJgjTyrZ_hdcx2Q" />
          </div>
        </div>

        {/* Category 3 */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl text-primary-container mb-4">Pohyb a tělo</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Vědomý pohyb jako cesta k propojení se svou vlastní podstatou a vitalitou.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <div className="h-80 rounded-xl overflow-hidden shadow-lg">
                <img alt="Pilates Reformer" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wfmYRgZQAV8wY2cOLN7dXuwQSribeui17-mMZlUY1xr535-3t5_GQZt2PhxoLArxWN3-7mT6DMLpF6GS2ckWmvsrJhtziO7yOhbVdat6Et4O9FHyGLjTubmHUw-R1xoJ0IjyOJlASG1zUmAnZvE9Jd182zvQp0CEowaPoV4LMCHRkyfd-igsJBJNet1IkXglT-r3VzyijMCj-FFebZT5TsWsIv6X9NaiEJ-0vANvpasBJcMYoMGGrxUNZMv9rOFL-unxQfVrz1s" />
              </div>
              <div>
                <h3 className="font-headline text-2xl mb-2 text-on-surface">Pilates (Eco Reformer)</h3>
                <p className="text-on-surface-variant">Precizní cvičení na ekologických dřevěných stroji pro vyrovnání svalových dysbalancí a posílení středu těla.</p>
              </div>
            </div>
            <div className="flex flex-col gap-6 lg:mt-12">
              <div className="h-80 rounded-xl overflow-hidden shadow-lg">
                <img alt="Meditation" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVkv-6yTw3GCfon4xp8n6cJPozCcMXhp9fskdet2wkQcqJEMAb-0jezbUeczvvb1QQ10_uY9lVhFiSBkoZ4bnjGpzM2wa64SbZ2GKmaQwz9kkzea-ruWvlsv1thEZpj9bsU7WnX6T1mm2OrfB8C-EP9wdOkmViaPv9jmKhbjN_zQ85oUxB1W2VzQcSer0BihRJ1OpaxaDarM_epq-QBZ47szB9ep-Z_IP-VcK_B8cAgSnma1Al1PplFmrvbGXmgooFn3b1TKs_S9U" />
              </div>
              <div>
                <h3 className="font-headline text-2xl mb-2 text-on-surface">Kundalini Jóga</h3>
                <p className="text-on-surface-variant">Jóga vědomí pracující s dechem, dynamickými ásanami a meditací pro probuzení životní energie.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category 4 */}
        <div className="mb-32 bg-surface-container-highest p-12 rounded-xl">
          <h2 className="font-headline text-3xl text-primary-container mb-12 text-center">Smyslová a energetická péče</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'surround_sound', title: 'Tibetské zvukové masáže', desc: 'Hluboká relaxace skrze vibrace ručně tepaných mís přímo na těle.' },
              { icon: 'local_florist', title: 'Bachovy esence', desc: 'Individuální míchání květových esencí pro emoční rovnováhu a stabilitu.' },
              { icon: 'palette', title: 'Aroma Esence Art', desc: 'Kreativní propojení aromaterapie a intuitivní tvorby pro uvolnění bloků.' },
            ].map(s => (
              <div key={s.title} className="bg-surface p-8 rounded-lg shadow-sm text-center">
                <span className={`material-symbols-outlined text-[#765a17] dark:text-[#ffdf9f] text-5xl mb-4`}>{s.icon}</span>
                <h4 className="font-headline text-xl mb-3 text-on-surface">{s.title}</h4>
                <p className="text-sm text-on-surface-variant">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Library */}
      <section className="bg-primary-container text-surface py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-on-primary-container/20 rounded-full blur-3xl"></div>
            <img alt="Books" className="rounded-xl shadow-2xl relative z-10 w-full object-cover h-[500px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmpRdL4AiN3EJhtRGZZ9tvYS2pZJPIiCnIzCkcMZWqXAaAq4ObIZzHITeggISzKjQnSSLEbih_krNScZptTGwfgSz14jP2FDBLV5Ff80dJA_cdiJGlUYeccKf-0J5Bq95_hV2xOVzLNmw7ha268wv5FFk8IoJHgEHimssigKg1ZsVGmtsT5Bt_WwlpLVqG2Cpd8TM7JxtmThctnz2ITGqj4985C8RGKVbT7EFNUYXAfMYWgAXS2mdhsLUY5rDJvA3Q2Q14mwxPgXY" />
          </div>
          <div>
            <h2 className="font-headline text-4xl mb-6 text-[#faf9f4]">Charitativní knihovna</h2>
            <p className="text-on-primary-container text-lg mb-8 leading-relaxed">Věříme v dostupnost péče. Naše charitativní knihovna v prostorách studia slouží jako fond pro ty, kteří se ocitli v náročné životní situaci.</p>
            <p className="text-on-primary-container/80 mb-10 italic">&quot;Půjčením nebo darováním knihy přispíváte do fondu, ze kterého hradíme terapeutická sezení klientům v nouzi. Společně tvoříme kruh podpory.&quot;</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-surface text-primary-container px-8 py-3 rounded-full font-semibold hover:bg-secondary-fixed transition-colors">Jak se zapojit</button>
              <button className="border border-on-primary-container px-8 py-3 rounded-full font-semibold text-[#faf9f4] hover:bg-white/10 transition-colors">Žádost o podporu</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center bg-surface relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <span className="material-symbols-outlined text-[30rem] absolute -bottom-40 -right-40 text-primary-container">notifications</span>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-8">
          <h2 className="font-headline text-4xl md:text-5xl text-primary-container mb-8">Jste připraveni najít svůj vlastní rytmus?</h2>
          <p className="text-on-surface-variant text-lg mb-12">Rezervujte si úvodní konzultaci zdarma, kde společně najdeme cestu, která nejlépe vyhovuje vašim aktuálním potřebám.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/rezervace" className="bg-[#765a17] text-[#ffffff] px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all text-center">Rezervovat sezení</Link>
            <Link href="/about#kontakt" className="bg-surface-container-high text-on-surface px-10 py-4 rounded-xl text-lg font-semibold hover:bg-surface-container-highest transition-all text-center">Kontaktujte nás</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
