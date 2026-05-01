'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../../components/CartProvider';

export default function ProductDetailClient({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 font-plusjakarta">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm opacity-60 mb-10 font-plusjakarta">
        <Link href="/eshop" className="hover:opacity-100 hover:text-[#765a17] transition-colors">E-shop</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        {product.category && <><span>{product.category}</span><span className="material-symbols-outlined text-base">chevron_right</span></>}
        <span className="opacity-100 text-on-surface truncate max-w-[300px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Image */}
        <div className="sticky top-28">
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-low aspect-square shadow-xl">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant opacity-40" style={{ display: product.image ? 'none' : 'flex' }}>
              <span className="material-symbols-outlined text-8xl">image_not_supported</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#765a17]/10 text-[#765a17] dark:text-[#ffdf9f] mb-4">{product.category}</span>
          )}
          <h1 className="text-3xl lg:text-4xl font-notoserif italic leading-tight mb-4 text-on-surface">{product.name}</h1>
          <p className="text-3xl font-bold text-[#765a17] dark:text-[#ffdf9f] mb-8">{product.price.toLocaleString('cs-CZ')} Kč</p>

          {product.description && (
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-on-surface-variant leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Quantity + Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center bg-surface-container rounded-xl overflow-hidden border border-[#765a17]/20">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-5 py-4 text-lg font-bold hover:bg-[#765a17]/10 transition-colors">−</button>
              <span className="px-6 py-4 text-lg font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-5 py-4 text-lg font-bold hover:bg-[#765a17]/10 transition-colors">+</button>
            </div>
            <button onClick={handleAddToCart} className={`flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-base transition-all duration-300 ${added ? 'bg-green-600 text-white scale-95' : 'bg-[#765a17] text-white hover:bg-[#5b4300] hover:shadow-lg hover:scale-[1.02] active:scale-95'}`}>
              <span className="material-symbols-outlined">{added ? 'check_circle' : 'shopping_cart'}</span>
              {added ? 'Přidáno do košíku!' : 'Přidat do košíku'}
            </button>
          </div>

          {/* Stock */}
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

          {/* Benefits */}
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

          <div className="mt-10">
            <Link href="/eshop" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 hover:text-[#765a17] transition-all">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Zpět do E-Shopu
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
