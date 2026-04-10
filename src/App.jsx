import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EShopPage from './pages/EShopPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import AdminPage from './pages/AdminPage';
import { useCart } from './context/CartContext';

function Navigation() {
  const { cartAmount } = useCart();
  return (
    <header className="docked full-width top-0 sticky z-50 bg-[#faf9f4] dark:bg-[#101f0d] bg-opacity-80 backdrop-blur-xl shadow-[0_20px_40px_rgba(15,30,12,0.04)]">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-8 py-4">
        <Link to="/" className="text-2xl font-notoserif italic text-[#101f0d] dark:text-[#faf9f4] tracking-wide">
          Zelený Zvon
        </Link>
        <div className="hidden md:flex items-center space-x-12">
          <Link to="/about" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Studio
          </Link>
          <Link to="/services" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Služby
          </Link>
          <Link to="/eshop" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            E-shop
          </Link>
          <Link to="/contact" className="text-[#1b1c19] dark:text-[#faf9f4] hover:text-[#765a17] dark:hover:text-[#ffdf9f] font-plusjakarta tracking-wide transition-all duration-300 ease-in-out">
            Kontakt
          </Link>
        </div>
        <div className="flex items-center space-x-6 text-[#000000] dark:text-[#faf9f4]">
          <Link to="/checkout" className="relative transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartAmount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ffdf9f] text-[#101f0d] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartAmount}
              </span>
            )}
          </Link>
          <Link to="/admin" className="transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined">person</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
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
            <li><Link to="/about" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Studio / O nás</Link></li>
            <li><Link to="/services" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Služby</Link></li>
            <li><Link to="/eshop" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">E-shop</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-notoserif font-bold mb-6">Užitečné odkazy</h4>
          <ul className="space-y-3 font-plusjakarta text-sm">
            <li><Link to="/contact" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Kontakt</Link></li>
            <li><Link to="#" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Obchodní podmínky</Link></li>
            <li><Link to="#" className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors">Ochrana údajů</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-notoserif font-bold mb-6">Sledujte nás</h4>
          <div className="flex gap-4">
            <a className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors" href="#">Instagram</a>
            <a className="opacity-70 hover:opacity-100 hover:text-[#765a17] transition-colors" href="#">Facebook</a>
          </div>
          <div className="mt-8">
            <p className="text-xs opacity-50">© 2024 Zelený Zvon. Vytvořeno pro váš vnitřní klid.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eshop" element={<EShopPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
