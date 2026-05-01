import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // ── Načtení produktu dle slugu ──────────────────────────────────────────────
  useEffect(() => {
    setProduct(null);
    setNotFound(false);

    fetch(`${API_URL}/products/by-slug/${encodeURIComponent(slug)}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then(data => { if (data) setProduct(data); })
      .catch(err => { console.error(err); setNotFound(true); });
  }, [slug]);

  // ── Dynamické vložení JSON-LD do <head> ────────────────────────────────────
  useEffect(() => {
    if (!product) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'product-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'DietarySupplement',
      'name': product.name,
      'url': `https://www.zelenyzvon.cz/eshop/${product.slug || product.id}`,
      'image': product.image,
      'description': product.description,
      'offers': {
        '@type': 'Offer',
        'price': String(product.price),
        'priceCurrency': 'CZK',
        'availability': 'https://schema.org/InStock',
        'url': `https://www.zelenyzvon.cz/eshop/${product.slug || product.id}`,
      },
    });

    // Odstraníme předchozí JSON-LD (při navigaci mezi produkty)
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();

    document.head.appendChild(script);

    // Cleanup při opuštění stránky
    return () => {
      const el = document.getElementById('product-jsonld');
      if (el) el.remove();
    };
  }, [product]);

  // ── Stavy načítání ──────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center font-plusjakarta">
        <span className="material-symbols-outlined text-6xl opacity-30 mb-6 block">search_off</span>
        <h1 className="text-3xl font-notoserif italic mb-4">Produkt nenalezen</h1>
        <p className="opacity-60 mb-8">Tento produkt bohužel není v nabídce.</p>
        <Link to="/eshop" className="btn-primary inline-block">← Zpět do E-Shopu</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center font-plusjakarta">
        <div className="inline-block w-12 h-12 border-4 border-[#765a17]/30 border-t-[#765a17] rounded-full animate-spin mb-6" />
        <p className="opacity-60 italic">Načítám produkt...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 font-plusjakarta">

      {/* Drobečková navigace */}
      <nav className="flex items-center gap-2 text-sm opacity-60 mb-10 font-plusjakarta">
        <Link to="/eshop" className="hover:opacity-100 hover:text-[#765a17] transition-colors">
          E-shop
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        {product.category && (
          <>
            <span>{product.category}</span>
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </>
        )}
        <span className="opacity-100 text-on-surface truncate max-w-[300px]">{product.name}</span>
      </nav>

      {/* Hlavní obsah — 2 sloupce */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Levý sloupec — obrázek */}
        <div className="sticky top-28">
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-low aspect-square shadow-xl">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="absolute inset-0 flex items-center justify-center text-on-surface-variant opacity-40"
              style={{ display: product.image ? 'none' : 'flex' }}
            >
              <span className="material-symbols-outlined text-8xl">image_not_supported</span>
            </div>
          </div>
        </div>

        {/* Pravý sloupec — informace */}
        <div>
          {product.category && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#765a17]/10 text-[#765a17] dark:text-[#ffdf9f] mb-4">
              {product.category}
            </span>
          )}

          <h1 className="text-3xl lg:text-4xl font-notoserif italic leading-tight mb-4 text-on-surface">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-[#765a17] dark:text-[#ffdf9f] mb-8">
            {product.price.toLocaleString('cs-CZ')} Kč
          </p>

          {product.description && (
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-on-surface-variant leading-relaxed text-base"
                 dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Výběr množství + košík */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center bg-surface-container rounded-xl overflow-hidden border border-[#765a17]/20">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-5 py-4 text-lg font-bold hover:bg-[#765a17]/10 transition-colors"
              >
                −
              </button>
              <span className="px-6 py-4 text-lg font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-5 py-4 text-lg font-bold hover:bg-[#765a17]/10 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 ${
                added
                  ? 'bg-green-600 text-white scale-95'
                  : 'bg-[#765a17] text-white hover:bg-[#5b4300] hover:shadow-lg hover:scale-[1.02] active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined">
                {added ? 'check_circle' : 'shopping_cart'}
              </span>
              {added ? 'Přidáno do košíku!' : 'Přidat do košíku'}
            </button>
          </div>

          {/* Skladová dostupnost */}
          {product.stock > 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 mb-8">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Skladem — expedice do 2 pracovních dnů</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-600 mb-8">
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>Dočasně nedostupné</span>
            </div>
          )}

          {/* Výhody */}
          <div className="border-t border-[#765a17]/10 pt-8 space-y-4">
            {[
              { icon: 'local_shipping', text: 'Doprava zdarma při objednávce nad 1 500 Kč' },
              { icon: 'eco', text: 'Přírodní složení bez umělých přísad' },
              { icon: 'verified', text: 'Pečlivě vybraný od prověřených výrobců' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-3 text-sm opacity-70">
                <span className="material-symbols-outlined text-[#765a17] text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Zpět */}
          <div className="mt-10">
            <Link
              to="/eshop"
              className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-[#765a17] transition-all"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Zpět do E-Shopu
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
