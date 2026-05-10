'use client';

import Link from 'next/link';
import { useCart } from '../../components/CartProvider';

export default function AboutProducts({ products }) {
  const { addToCart } = useCart();

  return (
    <section className="py-32 bg-surface-container-low text-on-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-notoserif mb-4 text-primary-container">Kousek Zeleného Zvonu u vás doma</h2>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">V našich terapiích využíváme sílu čisté přírody. Tyto a mnoho dalších produktů nabízíme i vám.</p>
          </div>
          <Link href="/eshop" className="bg-primary-container text-on-primary px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all inline-block mt-8 md:mt-0">Celá nabídka e-shopu</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map(product => (
            <div key={product.id} className="group flex flex-col justify-between h-full">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-high mb-4 aspect-[4/5] cursor-pointer">
                <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.image || 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'} />
                <button onClick={() => addToCart(product)} className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110">
                  <span className="material-symbols-outlined text-primary-container">shopping_bag</span>
                </button>
              </div>
              <div className="px-2 flex-grow flex flex-col justify-end">
                <p className="text-[10px] uppercase tracking-widest text-[#765a17] dark:text-[#ffdf9f] font-bold mb-1">{product.category}</p>
                <h3 className="text-lg font-notoserif text-on-surface leading-tight mb-2">{product.name}</h3>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className="text-lg font-semibold">{product.price?.toLocaleString('cs-CZ')} Kč</span>
                  <button onClick={() => addToCart(product)} className="flex items-center gap-1.5 text-sm font-semibold text-[#765a17] bg-[#765a17]/10 dark:text-[#ffdf9f] dark:bg-[#ffdf9f]/10 px-4 py-2 rounded-full hover:bg-[#765a17] hover:text-white dark:hover:bg-[#ffdf9f] dark:hover:text-neutral-900 transition-all active:scale-95">
                    <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    Do košíku
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
