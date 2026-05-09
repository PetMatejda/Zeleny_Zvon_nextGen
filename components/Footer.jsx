import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="full-width rounded-t-[1.5rem] mt-20 bg-[#f5f4ef] dark:bg-[#0f1e0c] text-[#1b1c19] dark:text-[#faf9f4]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 py-16">
        <div className="md:col-span-1">
          <span className="text-xl font-notoserif text-[#101f0d] dark:text-[#faf9f4] mb-4 block">Zelený Zvon</span>
          <p className="text-sm opacity-70 font-plusjakarta leading-relaxed">Místo, kde tělo a duše nacházejí společnou řeč. Váš partner na cestě k vnitřnímu klidu a harmonii.</p>
        </div>
        <div>
          <h4 className="font-notoserif font-bold mb-6">Navigace</h4>
          <ul className="space-y-3 font-plusjakarta text-sm">
            <li><Link href="/about" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Studio / O nás</Link></li>
            <li><Link href="/services" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Služby</Link></li>
            <li><Link href="/eshop" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">E-shop</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-notoserif font-bold mb-6">Užitečné odkazy</h4>
          <ul className="space-y-3 font-plusjakarta text-sm">
            <li><Link href="/contact" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Kontakt</Link></li>
            <li><Link href="#" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Obchodní podmínky</Link></li>
            <li><Link href="#" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Ochrana údajů</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-notoserif font-bold mb-6">Sledujte nás</h4>
          <div className="flex gap-4">
            <a className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors" href="#">Instagram</a>
            <a className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors" href="#">Facebook</a>
          </div>
          <div className="mt-8">
            <p className="text-xs opacity-50">© {new Date().getFullYear()} Zelený Zvon. Vytvořeno pro váš vnitřní klid.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
