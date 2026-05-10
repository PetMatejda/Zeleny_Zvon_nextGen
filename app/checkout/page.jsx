'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartProvider';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    address: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}`);
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Neplatný kupón.');
        setCouponResult(null);
      } else {
        setCouponResult(data);
      }
    } catch (err) {
      setCouponError('Chyba při ověřování kupónu.');
    }
  };

  const finalPrice = () => {
    if (!couponResult) return cartTotal;
    if (couponResult.discount_type === 'percent') {
      return cartTotal * (1 - couponResult.discount_value / 100);
    }
    return Math.max(0, cartTotal - couponResult.discount_value);
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const orderData = {
      customerName: formData.customerName,
      email: formData.email,
      address: formData.address,
      totalAmount: cartTotal,
      couponCode: couponResult ? couponCode : undefined,
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
    };

    try {
      const res = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        sessionStorage.setItem('lastOrder', JSON.stringify(data));
        router.push('/checkout/success');
      } else {
        alert("Chyba při odesílání objednávky: " + (data.error || "Neznámá chyba"));
      }
    } catch (err) {
      alert("Došlo k chybě: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-8 pt-20 pb-32 text-center font-plusjakarta">
        <h1 className="text-4xl font-headline italic mb-6">Váš košík je prázdný</h1>
        <p className="mb-8 opacity-70">Zatím jste si žádný produkt nevybrali.</p>
        <button onClick={() => router.push('/eshop')} className="px-8 py-3 bg-[#765a17] text-white rounded-full font-bold hover:bg-[#5b4300] transition-colors">
          Zpět do e-shopu
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 font-plusjakarta flex flex-col lg:flex-row gap-16 lg:gap-24">
      <div className="flex-1 lg:max-w-3xl">
        <h1 className="text-4xl font-headline italic mb-8 text-[#1b1c19] dark:text-[#faf9f4]">Dokončení objednávky</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <h3 className="text-xl font-bold mb-4 border-b border-[#765a17]/20 pb-2">Kontaktní údaje</h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">Jméno a příjmení</label>
                  <input type="text" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-[#765a17] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">E-mail (pro zaslání faktury a platby)</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-[#765a17] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">Fakturační adresa (ulice, město, PSČ)</label>
                  <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-[#765a17] transition-all"></textarea>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-[#765a17]/20">
             <h3 className="text-xl font-bold mb-4">Máte slevový kupón?</h3>
             <div className="flex gap-4">
               <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Zadejte kód kupónu" className="flex-1 px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-[#765a17] transition-all uppercase" />
               <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 bg-surface-container-high hover:bg-surface-variant font-bold rounded-xl transition-all">Ověřit</button>
             </div>
             {couponResult && <p className="text-green-600 font-bold mt-2 text-sm">Kupón úspěšně aplikován!</p>}
             {couponError && <p className="text-red-500 font-bold mt-2 text-sm">{couponError}</p>}
          </div>

          <div className="pt-8">
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#765a17] text-white rounded-xl font-bold text-lg hover:bg-[#5b4300] hover:shadow-xl transition-all disabled:opacity-50 flex justify-center items-center gap-3">
              {isSubmitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">payments</span>}
              {isSubmitting ? 'Zpracovávám...' : 'Závazně objednat a zaplatit'}
            </button>
            <p className="text-center text-sm opacity-60 mt-4">Kliknutím souhlasíte s obchodními podmínkami a zavazujete se k platbě převodem.</p>
          </div>
        </form>
      </div>

      <div className="lg:w-[450px] xl:w-[480px]">
        <div className="bg-surface-container-low p-8 lg:p-10 rounded-3xl sticky top-28 shadow-xl border border-[#765a17]/5">
          <h2 className="text-2xl font-headline italic mb-6 border-b border-[#765a17]/20 pb-4">Shrnutí košíku</h2>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col gap-3 border-b border-[#765a17]/10 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start gap-4">
                   <div className="flex-1">
                     <Link href={`/eshop/${item.slug || item.id}`}>
                       <h4 className="font-bold text-on-surface leading-tight hover:text-[#765a17] transition-colors hover:underline underline-offset-4 cursor-pointer">{item.name}</h4>
                     </Link>
                   </div>
                   <span className="font-semibold text-nowrap">{formatPrice(item.price * item.quantity)} Kč</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3 bg-surface-container rounded-full px-2 py-1 border border-[#765a17]/20">
                     <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#765a17] hover:bg-[#765a17]/10 rounded-full transition-colors font-bold text-lg">
                       -
                     </button>
                     <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                     <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-[#765a17] hover:bg-[#765a17]/10 rounded-full transition-colors font-bold text-lg">
                       +
                     </button>
                   </div>
                   <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-semibold">
                     <span className="material-symbols-outlined text-[18px]">delete</span> Odebrat
                   </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#765a17]/20 pt-4 space-y-2 mb-6">
             <div className="flex justify-between text-sm opacity-70">
               <span>Mezisoučet</span>
               <span>{formatPrice(cartTotal)} Kč</span>
             </div>
             {couponResult && (
               <div className="flex justify-between text-sm text-green-600 font-bold">
                 <span>Sleva ({couponCode})</span>
                 <span>-{formatPrice(cartTotal - finalPrice())} Kč</span>
               </div>
             )}
             <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-[#765a17]/20">
               <span>Celkem k úhradě</span>
               <span className="text-[#765a17] dark:text-[#ffdf9f]">{formatPrice(finalPrice())} Kč</span>
             </div>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-60">
             <span className="material-symbols-outlined text-base">lock</span>
             <span>Vaše údaje jsou u nás v bezpečí</span>
          </div>
        </div>
      </div>
    </main>
  );
}
