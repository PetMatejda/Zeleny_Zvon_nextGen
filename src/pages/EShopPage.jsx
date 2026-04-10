import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function EShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Všechny produkty');
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20 font-notoserif italic text-xl">Načítám eshop...</div>;

  const categories = ['Všechny produkty', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const filteredProducts = activeFilter === 'Všechny produkty' 
    ? products 
    : products.filter(p => p.category === activeFilter);

  // Zobrazujeme Hero produkty jen, když není aktivní nějaký specifický filtr
  const heroProducts = products.filter(p => p.is_hero === 1);
  const regularProducts = activeFilter === 'Všechny produkty' ? filteredProducts.filter(p => p.is_hero !== 1) : filteredProducts;

  const ProductCard = ({ product }) => (
    <div className="group flex flex-col justify-between h-full">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low mb-4 aspect-[4/5] cursor-pointer">
        <div className="block h-full w-full bg-surface-container-high/30">
          <img 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            src={product.image || 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'} 
            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'}
          />
        </div>
        {product.is_hero === 1 && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#765a17] text-white">
            Doporučujeme
          </span>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
        >
          <span className="material-symbols-outlined text-primary-container">shopping_bag</span>
        </button>
      </div>
      <div className="px-2 flex-grow flex flex-col justify-end">
        <p className="text-[10px] uppercase tracking-widest text-[#765a17] dark:text-[#ffdf9f] font-bold mb-1">{product.category}</p>
        <h3 className="text-lg font-notoserif text-on-surface leading-tight mb-2">
          {product.name}
        </h3>
        <p className="text-sm opacity-70 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-semibold">{product.price.toLocaleString('cs-CZ')} Kč</span>
          <button 
             onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="text-sm font-medium text-[#765a17] dark:text-[#ffdf9f] underline underline-offset-4 hover:text-primary-container transition-colors"
          >
            Vložit do košíku
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-24 font-plusjakarta">
      <header className="mb-16">
        <h1 className="text-5xl font-headline italic mb-4 text-primary-container">E-shop pro duši</h1>
        <p className="text-lg font-body max-w-2xl opacity-80 leading-relaxed">Vybrané esence a produkty vytvořené k navrácení vnitřní rovnováhy a harmonie do vašeho každodenního života.</p>
      </header>

      {heroProducts.length > 0 && activeFilter === 'Všechny produkty' && (
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-notoserif italic text-[#1b1c19] dark:text-[#faf9f4]">Výběr toho nejlepšího</h2>
            <div className="flex-1 h-px bg-[#765a17]/20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {heroProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Filters section */}
      <section className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter 
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-[#765a17] hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Regular Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {regularProducts.map(product => (
           <ProductCard key={product.id} product={product} />
        ))}
      </div>

       <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <img 
            alt="Kvalita produktů" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAro-IjWMuwd_xhbxDoC40WwMFGUHHpH_aaLnQKJy-Go4vBZN-bJnDyz1MNI0D8BW0yrfTGymKAD2exG6BEnm0_BcG_fOIb9qAubtv87q0zZg5uSAGnmD1w91n6GFm88cHmkascbZd5z89vgFsJWGJfJa27EfPMFiQ-XL7P7QF8mZHeKDYspTreFyVqrQalshMR6p__oKl0tNpLSbsxEdzQEUaHSuRgqWkNHNlBFEZflHo06RYjhTSZCdUgNksjlB36WmgwpvUcBw"
          />
          <div className="absolute inset-0 bg-primary-container/10"></div>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-headline italic mb-6 leading-tight text-primary-container">Poctivost v každé kapce</h2>
            <p className="text-lg opacity-80 leading-relaxed font-body text-on-surface">Věříme, že skutečná síla pochází z přírody a trpělivosti. Každý produkt v našem e-shopu je výsledkem pečlivého výběru a ručního zpracování.</p>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5b4300]">eco</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Čisté přírodní složení</h4>
                <p className="text-sm opacity-70">Používáme výhradně organické suroviny bez syntetických barviv a konzervantů.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
