import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    address: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/coupons/validate?code=${couponCode}`);
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
      return Math.round(cartTotal * (1 - couponResult.discount_value / 100));
    }
    return Math.max(0, cartTotal - couponResult.discount_value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Formatting for backend: { customerName, email, totalAmount, items, couponCode }
    const orderData = {
      customerName: formData.customerName,
      email: formData.email,
      totalAmount: cartTotal, // Backend si to také zkontroluje
      couponCode: couponResult ? couponCode : undefined,
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        navigate('/checkout/success', { state: { order: data } });
      } else {
        alert("Chyba při odesílání objednávky: " + (data.error || "Neznámá chyba"));
      }
    } catch (err) {
      alert("Došlo k chybě: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-8 pt-20 pb-32 text-center font-plusjakarta">
        <h1 className="text-4xl font-headline italic mb-6">Váš košík je prázdný</h1>
        <p className="mb-8 opacity-70">Zatím jste si žádný produkt nevybrali.</p>
        <button onClick={() => navigate('/eshop')} className="px-8 py-3 bg-[#765a17] text-white rounded-full font-bold hover:bg-[#5b4300] transition-colors">
          Zpět do e-shopu
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-8 pt-12 pb-24 font-plusjakarta flex flex-col lg:flex-row gap-16">
      <div className="flex-1">
        <h1 className="text-4xl font-headline italic mb-8 text-[#1b1c19] dark:text-[#faf9f4]">Dokončení objednávky</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <h3 className="text-xl font-bold mb-4 border-b border-[#765a17]/20 pb-2">Kontaktní údaje</h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">Jméno a příjmení</label>
                  <input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} type="text" className="w-full p-3 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-[#765a17]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">E-mail beze spěchu</label>
                  <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full p-3 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-[#765a17]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 opacity-80">Dodací (fyzická) adresa / fakturační údaje</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-[#765a17] min-h-[100px]"></textarea>
                </div>
             </div>
          </div>
          
          <div className="pt-6">
             <h3 className="text-xl font-bold mb-4 border-b border-[#765a17]/20 pb-2">Platba</h3>
             <div className="p-4 rounded-xl border-2 border-[#765a17] bg-[#765a17]/5 flex items-start gap-4">
               <span className="material-symbols-outlined text-[#765a17] text-3xl">qr_code_scanner</span>
               <div>
                 <p className="font-bold">Platba převodem / QR kódem</p>
                 <p className="text-sm opacity-80 mt-1">Platební údaje a QR kód vám zobrazíme ihned po potvrzení objednávky a zašleme do e-mailu.</p>
               </div>
             </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 mt-8 bg-[#101f0d] dark:bg-[#faf9f4] text-[#faf9f4] dark:text-[#101f0d] font-bold rounded-full text-lg hover:bg-[#765a17] dark:hover:bg-[#ffdf9f] transition-all flex items-center justify-center gap-2">
            {isSubmitting ? 'Zpracovává se...' : 'Závazně objednat s povinností platby'}
             <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </div>

      <div className="w-full lg:w-[400px]">
        <div className="bg-surface-container-low rounded-2xl p-6 sticky top-24">
          <h3 className="text-2xl font-notoserif italic mb-6">Shrnutí košíku</h3>
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-surface-container-high/50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs opacity-70">{item.quantity} ks x {item.price} Kč</p>
                </div>
                <p className="font-bold ml-4">{item.quantity * item.price} Kč</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#765a17]/20 pt-6 mb-6">
            <h4 className="font-bold text-sm mb-2 opacity-80">Máte slevový kupón?</h4>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} type="text" placeholder="Zadejte kód" className="w-full p-2 rounded-lg bg-surface-container-high border-none focus:ring-[#765a17] uppercase text-sm" />
              <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-[#765a17] text-white rounded-lg text-sm font-bold hover:bg-[#5b4300]">Uplatnit</button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-2 font-bold">{couponError}</p>}
            {couponResult && <p className="text-green-600 dark:text-green-400 text-xs mt-2 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Kupón aplikován!</p>}
          </div>

          <div className="border-t border-[#765a17]/20 pt-6">
             <div className="flex justify-between items-center mb-2">
               <span className="opacity-70">Mezisoučet</span>
               <span>{cartTotal} Kč</span>
             </div>
             {couponResult && (
               <div className="flex justify-between items-center mb-2 text-green-600 dark:text-green-400 font-bold">
                 <span>Sleva</span>
                 <span>- {cartTotal - finalPrice()} Kč</span>
               </div>
             )}
             <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-[#1b1c19]/10">
               <span>Celkem k úhradě</span>
               <span>{finalPrice()} Kč</span>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
