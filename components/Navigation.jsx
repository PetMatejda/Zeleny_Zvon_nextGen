'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Navigation() {
  const { cartAmount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="w-full top-0 sticky z-50 bg-[#faf9f4] dark:bg-[#101f0d] bg-opacity-80 backdrop-blur-xl shadow-[0_20px_40px_rgba(15,30,12,0.04)]">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="https://be43f77103.clvaw-cdnwnd.com/7e020fcf408e821cb2e88418c25b9f42/200000462-826a9826ab/C-0.png?ph=be43f77103"
            alt="Zelený Zvon Logo"
            className="h-10 w-auto group-hover:opacity-80 transition-opacity"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="text-2xl font-notoserif italic text-[#101f0d] dark:text-[#faf9f4] tracking-wide" style={{ display: 'none' }}>
            Zelený Zvon
          </span>
        </Link>

        {/* Desktop Menu */}
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

        <div className="flex items-center space-x-4 md:space-x-6 text-[#000000] dark:text-[#faf9f4]">
          <Link href="/checkout" className="relative transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95 p-2">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartAmount > 0 && (
              <span className="absolute top-0 right-0 bg-[#765a17] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {cartAmount}
              </span>
            )}
          </Link>
          <Link href="/admin" className="transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95 p-2 hidden sm:block">
            <span className="material-symbols-outlined">person</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 transition-all active:scale-90"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#faf9f4] dark:bg-[#101f0d] border-t border-[#765a17]/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-8 space-y-6">
            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-notoserif italic text-[#1b1c19] dark:text-[#faf9f4]"
            >
              Studio
            </Link>
            <Link 
              href="/services" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-notoserif italic text-[#1b1c19] dark:text-[#faf9f4]"
            >
              Služby
            </Link>
            <Link 
              href="/eshop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-notoserif italic text-[#1b1c19] dark:text-[#faf9f4]"
            >
              E-shop
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-notoserif italic text-[#1b1c19] dark:text-[#faf9f4]"
            >
              Kontakt
            </Link>
            <div className="pt-6 border-t border-[#765a17]/10 flex justify-between items-center">
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm opacity-60">
                <span className="material-symbols-outlined">person</span>
                Administrace
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
