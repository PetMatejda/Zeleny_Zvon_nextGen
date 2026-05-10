'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../components/CartProvider';
import Link from 'next/link';

const PACKETA_API_KEY = process.env.NEXT_PUBLIC_PACKETA_API_KEY || '';

const BASE_SHIPPING_OPTIONS = [
  {
    id: 'pickup',
    label: 'Osobní odběr',
    description: 'Vyzvednutí na naší provozovně po domluvě',
    icon: 'store',
  },
  {
    id: 'home_delivery',
    label: 'Zásilkovna — doručení domů',
    description: 'Doručení kurýrem až ke dveřím',
    icon: 'local_shipping',
  },
  {
    id: 'packeta_zbox',
    label: 'Zásilkovna — výdejní místa & Z-BOX',
    description: 'Vyzvednutí na vybraném místě',
    icon: 'package_2',
  },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    address: ''
  });

  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [packetaPoint, setPacketaPoint] = useState(null); // { id, name, city }
  const [deliveryAddress, setDeliveryAddress] = useState({ street: '', houseNumber: '', zip: '', city: '' });

  const [shippingPrices, setShippingPrices] = useState({
    pickup: 0,
    home_delivery: 140, // defaultní fallback
    packeta_zbox: 95,   // defaultní fallback
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [packetaLoaded, setPacketaLoaded] = useState(false);
  const packetaScriptRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Dynamické načtení Packeta Widget v6
    if (!document.querySelector('script[src*="widget.packeta.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://widget.packeta.com/v6/www/js/library.js';
      script.async = true;
      script.onload = () => setPacketaLoaded(true);
      document.body.appendChild(script);
      packetaScriptRef.current = script;
    } else {
      setPacketaLoaded(true);
    }

    // Dynamické načtení cen dopravy
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        setShippingPrices(prev => ({
          ...prev,
          home_delivery: data.price_packeta_home ? parseInt(data.price_packeta_home) : prev.home_delivery,
          packeta_zbox: data.price_packeta_zbox ? parseInt(data.price_packeta_zbox) : prev.packeta_zbox,
        }));
      })
      .catch(err => console.error('Nelze načíst ceny dopravy', err));

    return () => {
      // Neodstraňujeme script — může být potřeba při dalším použití
    };
  }, []);

  const openPacketaWidget = () => {
    if (!window.Packeta || !window.Packeta.Widget) {
      alert('Widget Zásilkovny se ještě načítá, zkuste za chvíli.');
      return;
    }
    window.Packeta.Widget.pick(
      PACKETA_API_KEY,
      (point) => {
        if (point) {
          setPacketaPoint({ id: point.id, name: point.name, city: point.city });
        }
      },
      { language: 'cs', country: 'cz' }
    );
  };

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
    let priceAfterDiscount = cartTotal;
    if (couponResult) {
      if (couponResult.discount_type === 'percent') {
        priceAfterDiscount = cartTotal * (1 - couponResult.discount_value / 100);
      } else {
        priceAfterDiscount = Math.max(0, cartTotal - couponResult.discount_value);
      }
    }
    const shippingCost = shippingPrices[shippingMethod] || 0;
    return priceAfterDiscount + shippingCost;
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const validateShipping = () => {
    if (shippingMethod === 'packeta_zbox' && !packetaPoint) {
      alert('Prosím vyberte výdejní místo Zásilkovny.');
      return false;
    }
    if (shippingMethod === 'home_delivery') {
      if (!deliveryAddress.street || !deliveryAddress.zip || !deliveryAddress.city) {
        alert('Vyplňte prosím celou doručovací adresu (ulice, PSČ, město).');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateShipping()) return;
    setIsSubmitting(true);
    
    const deliveryAddressStr = shippingMethod === 'home_delivery'
      ? `${deliveryAddress.street} ${deliveryAddress.houseNumber}, ${deliveryAddress.zip} ${deliveryAddress.city}`.trim()
      : undefined;

    const orderData = {
      customerName: formData.customerName,
      email: formData.email,
      address: formData.address,
      totalAmount: cartTotal,
      couponCode: couponResult ? couponCode : undefined,
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
      shippingMethod,
      packetaPointId: packetaPoint?.id?.toString() || undefined,
      packetaPointName: packetaPoint?.name || undefined,
      deliveryAddress: deliveryAddressStr,
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
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Kontaktní údaje */}
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

          {/* Způsob dopravy */}
          <div className="border-t border-[#765a17]/20 pt-6">
            <h3 className="text-xl font-bold mb-4">Způsob dopravy</h3>
            <div className="space-y-3">
              {BASE_SHIPPING_OPTIONS.map(option => {
                const currentPrice = shippingPrices[option.id] || 0;
                return (
                  <label
                    key={option.id}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      shippingMethod === option.id
                        ? 'border-[#765a17] bg-[#765a17]/5'
                        : 'border-transparent bg-surface-container hover:border-[#765a17]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={() => {
                        setShippingMethod(option.id);
                        if (option.id !== 'packeta_zbox') setPacketaPoint(null);
                      }}
                      className="mt-1 accent-[#765a17] w-4 h-4 flex-shrink-0"
                    />
                    <span className="material-symbols-outlined text-[#765a17] text-2xl flex-shrink-0 mt-0.5">{option.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{option.label}</div>
                      <div className="text-sm opacity-60">{option.description}</div>
                    </div>
                    <span className="font-bold text-[#765a17] flex-shrink-0 mt-1">
                      {currentPrice === 0 ? 'Zdarma' : `${currentPrice} Kč`}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Packeta Z-BOX widget trigger */}
            {shippingMethod === 'packeta_zbox' && (
              <div className="mt-4 p-5 bg-surface-container rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={openPacketaWidget}
                    disabled={!packetaLoaded}
                    className="flex items-center gap-2 px-5 py-3 bg-[#765a17] text-white rounded-xl font-bold hover:bg-[#5b4300] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">location_on</span>
                    {packetaLoaded ? 'Vybrat výdejní místo' : 'Načítám widget...'}
                  </button>
                  {packetaPoint ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
                      <span>
                        <span className="font-bold">{packetaPoint.name}</span>
                        {packetaPoint.city && <span className="opacity-60 ml-1">— {packetaPoint.city}</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPacketaPoint(null)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Změnit
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm opacity-60 italic">Žádné místo nevybráno</span>
                  )}
                </div>
              </div>
            )}

            {/* Home Delivery adresa */}
            {shippingMethod === 'home_delivery' && (
              <div className="mt-4 p-5 bg-surface-container rounded-xl space-y-3">
                <p className="text-sm font-semibold opacity-70">Doručovací adresa</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 opacity-60">Ulice</label>
                    <input
                      type="text"
                      required
                      placeholder="Např. Václavské náměstí"
                      value={deliveryAddress.street}
                      onChange={e => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-[#765a17] text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-60">Číslo domu</label>
                    <input
                      type="text"
                      placeholder="Např. 12/3a"
                      value={deliveryAddress.houseNumber}
                      onChange={e => setDeliveryAddress({...deliveryAddress, houseNumber: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-[#765a17] text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-60">PSČ</label>
                    <input
                      type="text"
                      required
                      placeholder="Např. 110 00"
                      value={deliveryAddress.zip}
                      onChange={e => setDeliveryAddress({...deliveryAddress, zip: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-[#765a17] text-sm transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 opacity-60">Město</label>
                    <input
                      type="text"
                      required
                      placeholder="Např. Praha"
                      value={deliveryAddress.city}
                      onChange={e => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-high border-none focus:ring-2 focus:ring-[#765a17] text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slevový kupón */}
          <div className="border-t border-[#765a17]/20 pt-6">
            <h3 className="text-xl font-bold mb-4">Máte slevový kupón?</h3>
            <div className="flex gap-4">
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Zadejte kód kupónu" className="flex-1 px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-[#765a17] transition-all uppercase" />
              <button type="button" onClick={handleApplyCoupon} className="px-6 py-3 bg-surface-container-high hover:bg-surface-variant font-bold rounded-xl transition-all">Ověřit</button>
            </div>
            {couponResult && <p className="text-green-600 font-bold mt-2 text-sm">Kupón úspěšně aplikován!</p>}
            {couponError && <p className="text-red-500 font-bold mt-2 text-sm">{couponError}</p>}
          </div>

          <div className="pt-2">
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
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#765a17] hover:bg-[#765a17]/10 rounded-full transition-colors font-bold text-lg">-</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-[#765a17] hover:bg-[#765a17]/10 rounded-full transition-colors font-bold text-lg">+</button>
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
              <div className="flex justify-between text-sm text-green-600 font-bold mb-2">
                <span>Sleva ({couponCode})</span>
                <span>-{formatPrice(
                  couponResult.discount_type === 'percent' 
                    ? cartTotal * (couponResult.discount_value / 100) 
                    : Math.min(cartTotal, couponResult.discount_value)
                )} Kč</span>
              </div>
            )}
            <div className="flex justify-between text-sm opacity-70">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">local_shipping</span>
                Doprava ({BASE_SHIPPING_OPTIONS.find(o => o.id === shippingMethod)?.label || '-'})
              </span>
              <span className="font-bold">{shippingPrices[shippingMethod] === 0 ? 'Zdarma' : `${shippingPrices[shippingMethod]} Kč`}</span>
            </div>
            {packetaPoint && (
              <div className="text-xs opacity-60 pl-5 -mt-1">
                {packetaPoint.name}{packetaPoint.city ? `, ${packetaPoint.city}` : ''}
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
