import Link from 'next/link';

export const metadata = {
  title: 'Kontakt | Zelený Zvon',
  description: 'Spojte se s námi. Holistické studio Petra Matějíčková.',
};

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-8 pt-24 pb-32 font-plusjakarta">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-headline italic mb-12 text-primary-container text-center">Kontakt</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Adresa Studia</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Zelený Zvon<br />
                V Brance 123<br />
                Praha 6, 160 00
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Petra Matějíčková</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Telefon: +420 123 456 789<br />
                E-mail: zelenyzvon@gmail.com
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Kde nás najdete</h2>
              <div className="aspect-video bg-surface-container-low rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl opacity-20">map</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-10 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-notoserif italic mb-8">Napište nám</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">Jméno</label>
                <input type="text" className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">E-mail</label>
                <input type="email" className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">Zpráva</label>
                <textarea rows="4" className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg resize-none"></textarea>
              </div>
              <button className="w-full bg-primary-container text-on-primary py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                Odeslat zprávu
              </button>
            </form>
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link href="/services" className="text-primary-container font-bold underline underline-offset-8 hover:opacity-80 transition-opacity">
            Chcete se raději rovnou objednat? Rezervujte si termín online.
          </Link>
        </div>
      </div>
    </main>
  );
}
