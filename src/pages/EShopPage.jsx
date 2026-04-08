import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'Krizová esence Rescue',
    category: 'Bachovy esence',
    price: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF0kq4HNLUYsqkkab3h_Fn6U6qv-HUoW5OH4X2d2NFZUxCI8GIivCKlW43Dgp3r7SV90zJiu2-wlyH3IIRWal80GBIMfy5Hno6jOwzyVbniRyHvLuM3Ibxp-JuDPQ7rZHhJ32VTCYXeU5lzGf-WdVvq-vlwJm5C8rGpudAuiyDnKUmcotDzyiUu92ljfwMoQJ5nfJgoQfO1mzludgSLvytjygjOzra1shMKG0sYv80ousfzxPY9cEA5emco0O7TygtEbLl0y_4fac',
    badge: 'Bestseller'
  },
  {
    id: 2,
    name: 'Sprej pro klidnou mysl',
    category: 'Aura spreje',
    price: 680,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSEu2esoxtQx46PhZSdC2cK-mj80ONCW_RdaA8Bl7eJWGujBTeY5cqSwGNooK4dJDQf3fGyelAH5VGQguEJdFnKiljpJEolLGH456bZMEfiMucvOaSH57spefk9MB31BRAnrzNkLnmgq-9UUovKsy836RJq8Zw9fE4km3K126a0YIduulk-5sALS3AkFtk0DbEzhpczFehdAPYgnmHTY_0WROTpy6QbgFzuhLGQMrtg96kgCjiEqRpg40lr0iMlxvsY2XIVnDgSWQ'
  },
  {
    id: 3,
    name: 'Večerní rituál harmonie',
    category: 'Bylinné směsi',
    price: 290,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcn7v6eJOtI0G5W4GMCoKTy59ByU7cnduPvZylbUhZdCdR200F6EJD5IFw5q8N5jpva4n3slPAsEPWVvtcwSMtRI9dRMkdr8uLilsBTBsNG4sF-A-qaKjgxj_auro-LbfnlZHG4tGMVImdtmYDoBeTu0K94xMdub4ZqinOjXpHMFESdNFWazL27O5ejvfI0o-4ZgOKQPJdzR7IYR1_tDLfDq5CThuZwxFC01gMGOEKn6eAdpYUSWC0N8z0gzcCpv95Y8Z7W49vEDU',
    badge: 'Novinka'
  },
  {
    id: 4,
    name: 'Zvonkohra Koshi - Voda',
    category: 'Produkty pro klid',
    price: 1250,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTxbY5WyyTR-Tomcq-o__CX-OyLx_QA7TGrshlYryJikl3Z-7jRi6mG0mZx9SCvHEf8isT1Nnewdm85b4dpoX3Xb95rtSUFKWFgAZ6A-546n4drYVh6-LmT8FzB12bpyABPPAF_AGKpmFrjP-6xN8M-BPyxhnA0BDSb0IJz69a4pT7wMhl9aiYWute_4RD0dh2A4Fx-X4L8Jjf4hGZ6mUxIU04yXEXJa0mNdHfrtatJAmrbGHk-7xHw2B79wxHMkWa7PeuoaHbTaQ'
  },
  {
    id: 5,
    name: 'Surový ametyst z Brazílie',
    category: 'Produkty pro klid',
    price: 890,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2-5x9vr5qZ26iVPW_M30ocgcAMOs8MhaF2YYukjmrrVPaFxN-5LA_dR6sY4-XU5RYwM3OM_noA9WNh5bOa79AXQ2C7I19bOIkNM-DyyIj863REEXJiVj0S_R6DugFQFbn1kXCtPxEu-MS3avzqFfiCwm1diVR-dzTVyCi-sUv_eONpTxMmqKZzQDA6wU8Kh4lTMLbtAcvQ1FG2SNqQKli4bztcfOrWmGlLQj9G5e7wnkTYlbr51dj3NE6L3QqzIeYcVwu6z6IgVU'
  },
  {
    id: 6,
    name: 'Esence pro sebedůvěru',
    category: 'Bachovy esence',
    price: 450,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTcxsTh4QyKqsE7Fh02vov-v0kTgGBS9om-YPspowcelYJLKjs4sHs8NASP8HS2jXCPLYpIXwwwGgvwQ7ojBv4Jf_Yg6FJDdv21eJ5GLv_92DYKpMBrXGrvqFo3N5RHLT8Yve8vpvjMfYKfCBcVsjgJYE7uiwOhVkWAD6XkVlhHpqOstu28WxDMG-QHxFFxI5Q04WX-UzHEeTEPJ6BFTikh4AWPBJwdMab5oi5pTMS7o5OSalOVtf_HqpTdySc4zDB5MvM1KI1h80'
  },
  {
    id: 7,
    name: 'Povzbuzující citrusový mix',
    category: 'Aura spreje',
    price: 540,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFDHXIMC8RxwnzkuQKzZgCiYIA40FDH8QHGTzbqdlhK0UL6vVhlp6S86576NN0obdn-Ble-1nQf5ftCuFDEJc4IFs7oEZobN2-3UM3Ii6x1M_N3Y3ezLb62KWBbPLQLFnxEFq3lFWpha7pc2U7Vn0oBAyuwg-a9Wobbwu8UfC0XWFeevzgSIzRNKzr1stwsvZspqwG9wb4OfDDlDpsfz63zH0lK6zzG-ijgFrW5RD6SWV-gc59znExwjCQv--wgwVtCiZOckGLjlU'
  },
  {
    id: 8,
    name: 'Ultrazvukový difuzér Dub',
    category: 'Produkty pro klid',
    price: 1890,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVvz2vU6A3f1YUi8T67QG7wEOPnWHihN7-s3q-kqy-IYWgKZGdbFjajjovq_NTFIQlYul5eYYzipsGzu2_QvseotWnMrPLQoaW-yu9rWMCFepN48ic0vZTbQktvkKqKZ8qlldiQkQddlvF4eW2zkjPuUhVUOqLYG6fx4Eiu0WRc-Q2D8Uzmp8_OkwxonkKPKAlIo8f4QfNkB8mb2XrUzZSLnj2Yr90o9LZDYL3e5yGuoEb_u--kJ8ZEOaxB7igmtlu2mv1IwxmK6Q'
  }
];

const filters = ['Všechny produkty', 'Bachovy esence', 'Aura spreje', 'Bylinné směsi', 'Produkty pro klid'];

export default function EShopPage() {
  const [activeFilter, setActiveFilter] = useState('Všechny produkty');

  const filteredProducts = activeFilter === 'Všechny produkty' 
    ? products 
    : products.filter(p => p.category === activeFilter);

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-24 font-plusjakarta">
      <header className="mb-16">
        <h1 className="text-5xl font-headline italic mb-4 text-primary-container">E-shop pro duši</h1>
        <p className="text-lg font-body max-w-2xl opacity-80 leading-relaxed">Vybrané esence a produkty vytvořené k navrácení vnitřní rovnováhy a harmonie do vašeho každodenního života.</p>
      </header>

      <section className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter 
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-fixed text-on-secondary-fixed'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-lg">
          <span className="text-xs uppercase tracking-widest font-semibold opacity-50">Řadit podle:</span>
          <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-on-surface">
            <option>Popularity</option>
            <option>Ceny (od nejnižší)</option>
            <option>Ceny (od nejvyšší)</option>
            <option>Novinek</option>
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredProducts.map(product => (
          <div key={product.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl bg-surface-container-low mb-4 aspect-[4/5]">
              <div className="block h-full w-full">
                <img 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={product.image} 
                />
              </div>
              {product.badge && (
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product.badge === 'Bestseller' 
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    : 'bg-primary-fixed text-on-primary-fixed-variant'
                }`}>
                  {product.badge}
                </span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Přidáno do košíku!');
                }}
                className="absolute bottom-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
              >
                <span className="material-symbols-outlined text-primary-container">shopping_bag</span>
              </button>
            </div>
            <div className="px-2">
              <p className="text-[10px] uppercase tracking-widest text-[#765a17] dark:text-[#ffdf9f] font-bold mb-1">{product.category}</p>
              <h3 className="text-lg font-notoserif text-on-surface leading-tight mb-2">
                <span className="hover:text-[#765a17] dark:hover:text-[#ffdf9f] transition-colors">{product.name}</span>
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{product.price.toLocaleString('cs-CZ')} Kč</span>
                <button 
                   onClick={(e) => {
                    e.stopPropagation();
                    alert('Přidáno do košíku!');
                  }}
                  className="text-sm font-medium text-[#765a17] dark:text-[#ffdf9f] underline underline-offset-4 hover:text-primary-container transition-colors"
                >
                  Vložit do košíku
                </button>
              </div>
            </div>
          </div>
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
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5b4300]">front_hand</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Ruční výroba</h4>
                <p className="text-sm opacity-70">Všechny směsi mícháme s úctou a záměrem přímo v našem ateliéru.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5b4300]">balance</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Energetická čistota</h4>
                <p className="text-sm opacity-70">Naše produkty jsou čištěny zvukem a krystaly pro maximální rezonanci.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
