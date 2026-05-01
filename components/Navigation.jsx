'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navigation() {
  const { cartAmount } = useCart();

  return (
    <header className="docked full-width top-0 sticky z-50 bg-[#faf9f4] dark:bg-[#101f0d] bg-opacity-80 backdrop-blur-xl shadow-[0_20px_40px_rgba(15,30,12,0.04)]">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="https://be43f77103.clvaw-cdnwnd.com/7e020fcf408e821cb2e88418c25b9f42/200000462-826a9826ab/C-0.png?ph=be43f77103"
            alt="Zelený Zvon Logo"
            className="h-10 w-auto group-hover:opacity-80 transition-opacity"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="text-2xl font-notoserif italic text-[#101f0d] dark:text-[#faf9f4] tracking-wide" style={{ display: 'none' }}>
            Zelený Zvon
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-12">
          <Link href="/about" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Studio
          </Link>
          <Link href="/services" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Služby
          </Link>
          <Link href="/eshop" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            E-shop
          </Link>
          <Link href="/contact" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Kontakt
          </Link>
        </div>
        <div className="flex items-center space-x-6 text-[#000000] dark:text-[#faf9f4]">
          <Link href="/checkout" className="relative transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartAmount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ffdf9f] text-[#101f0d] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartAmount}
              </span>
            )}
          </Link>
          <Link href="/admin" className="transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95">
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
