'use client';

import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'coupons', 'reservations', 'emails'
  const [orderFilter, setOrderFilter] = useState('Vše');
  const [emailTemplate, setEmailTemplate] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservationsList, setReservationsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false, slug: ''
  });
  
  const [newCoupon, setNewCoupon] = useState({
    code: '', discount_type: 'percent', discount_value: '', usage_limit: '', valid_from: '', valid_until: ''
  });

  const [newSlot, setNewSlot] = useState({
    title: '', date: '', timeSlot: '', capacity: 1, repeatFrequency: 'none', repeatCount: 1
  });

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLoginSuccess = async (response) => {
    try {
      const res = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setError('');
      } else {
        setError(data.error || 'Přihlášení se nezdařilo - nemáte oprávnění.');
      }
    } catch (e) {
      setError('Chyba při komunikaci se serverem.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await fetch(`/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) return handleLogout();
        setOrders(await res.json());
      } else if (activeTab === 'products') {
        const res = await fetch(`/api/products`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) return handleLogout();
        setProducts(await res.json());
      } else if (activeTab === 'coupons') {
        const res = await fetch(`/api/coupons`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) return handleLogout();
        setCoupons(await res.json());
      } else if (activeTab === 'reservations') {
        const [slotsRes, resRes] = await Promise.all([
            fetch(`/api/slots`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`/api/admin_reservations`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (slotsRes.status === 401 || resRes.status === 401) return handleLogout();
        setSlots(await slotsRes.json());
        setReservationsList(await resRes.json());
      } else if (activeTab === 'emails') {
        const res = await fetch(`/api/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) return handleLogout();
        const data = await res.json();
        setEmailTemplate(data.email_base_template || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}/items`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setSelectedOrderDetails({ ...order, items: await res.json() });
    } catch(e) { console.error(e); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) setNewProduct({ ...newProduct, image: data.url });
      else alert(data.error);
    } catch (err) {
      alert("Nahrání selhalo");
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const method = editingProductId ? 'PUT' : 'POST';
    const url = editingProductId ? `/api/products/${editingProductId}` : `/api/products`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false, slug: '' });
        setEditingProductId(null);
        fetchData();
      }
    } catch (e) {
      alert("Chyba při ukládání");
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Opravdu smazat?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch(e) { console.error('Chyba při mazání produktu:', e); }
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', usage_limit: '', valid_from: '', valid_until: '' });
        fetchData();
      }
    } catch (e) {
      alert("Chyba při ukládání kupónu");
    }
  };

  const deleteCoupon = async (id) => {
    if(!confirm("Opravdu smazat kupón?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch(e) { console.error('Chyba při mazání kupónu:', e); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch(e) { console.error('Chyba při aktualizaci stavu objednávky:', e); }
  };

  const saveSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSlot)
      });
      if (res.ok) {
        setNewSlot({ title: '', date: '', timeSlot: '', capacity: 1, repeatFrequency: 'none', repeatCount: 1 });
        fetchData();
      }
    } catch (e) {
      alert("Chyba při ukládání termínu");
    }
  };

  const deleteSlot = async (id) => {
    if(!confirm("Opravdu smazat vypsaný termín?")) return;
    try {
      const res = await fetch(`/api/slots/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch(e) { console.error('Chyba při mazání termínu:', e); }
  };

  const updateReservationStatus = async (id, status) => {
    let reason = null;
    if (status === 'cancelled') {
      reason = prompt("Zadejte volitelný důvod zamítnutí/zrušení (bude odesláno e-mailem), nebo nechte prázdné:");
      if (reason === null) return; // User clicked Cancel on prompt
    }

    try {
      const res = await fetch(`/api/admin_reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) fetchData();
      else {
        const d = await res.json();
        alert(d.error || 'Chyba');
      }
    } catch(e) {
      console.error(e);
      alert("Chyba při aktualizaci stavu rezervace.");
    }
  };

  const saveEmailTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email_base_template: emailTemplate })
      });
      if (res.ok) {
        alert("Šablona úspěšně uložena.");
        fetchData();
      } else {
        alert("Chyba při ukládání šablony.");
      }
    } catch (e) {
      alert("Chyba komunikace se serverem.");
    }
  };

  if (!mounted) return null;

  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 font-plusjakarta bg-surface text-on-surface">
        <h1 className="text-4xl font-headline mb-8">Administrace</h1>
        <div className="bg-surface-container-low p-12 rounded-xl shadow-lg border border-outline-variant max-w-md w-full text-center">
           <span className="material-symbols-outlined text-[#765a17] text-6xl mb-6">admin_panel_settings</span>
           <p className="mb-8 opacity-80">Pro vstup do administrace se přihlaste svým Google účtem.</p>
           {error && <p className="text-error mb-4 bg-error-container text-on-error-container p-3 rounded-lg font-bold">{error}</p>}
           <div className="flex justify-center"><GoogleLogin onSuccess={handleLoginSuccess} onError={() => setError('Přihlášení selhalo')} /></div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => orderFilter === 'Vše' || o.status === orderFilter);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-plusjakarta pb-20">
      <header className="bg-surface-container-high py-6 px-8 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-3xl font-headline italic text-primary-container">Administrace</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined">logout</span> Odhlásit se
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 mt-12 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
           <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'orders' ? 'bg-[#765a17] text-white shadow-md' : 'bg-surface-container hover:bg-surface-variant'}`}>
             <span className="material-symbols-outlined">list_alt</span> Objednávky
           </button>
           <button onClick={() => setActiveTab('products')} className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'products' ? 'bg-[#765a17] text-white shadow-md' : 'bg-surface-container hover:bg-surface-variant'}`}>
             <span className="material-symbols-outlined">inventory_2</span> Produkty
           </button>
           <button onClick={() => setActiveTab('coupons')} className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'coupons' ? 'bg-[#765a17] text-white shadow-md' : 'bg-surface-container hover:bg-surface-variant'}`}>
             <span className="material-symbols-outlined">local_activity</span> Slevové kupóny
           </button>
           <button onClick={() => setActiveTab('reservations')} className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'reservations' ? 'bg-[#765a17] text-white shadow-md' : 'bg-surface-container hover:bg-surface-variant'}`}>
             <span className="material-symbols-outlined">calendar_month</span> Rezervace a termíny
           </button>
           <button onClick={() => setActiveTab('emails')} className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'emails' ? 'bg-[#765a17] text-white shadow-md' : 'bg-surface-container hover:bg-surface-variant'}`}>
             <span className="material-symbols-outlined">mail</span> E-maily
           </button>
        </aside>

        <main className="flex-1 min-w-0">
           {loading ? (
             <div className="flex items-center justify-center p-20 opacity-50">
                <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
             </div>
           ) : (
             <>
               {/* ORDERS TAB */}
               {activeTab === 'orders' && (
                 <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['Vše', 'Nová', 'Zaplacená', 'Odeslaná', 'Zrušená'].map(f => (
                        <button key={f} onClick={() => setOrderFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold ${orderFilter === f ? 'bg-[#765a17] text-white' : 'bg-surface-container hover:bg-surface-variant'}`}>{f}</button>
                      ))}
                    </div>
                    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container text-sm uppercase opacity-70">
                          <tr><th className="p-4 font-semibold">ID</th><th className="p-4 font-semibold">Datum</th><th className="p-4 font-semibold">Zákazník</th><th className="p-4 font-semibold">Částka</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Akce</th></tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => (
                            <tr key={order.id} className="border-t border-outline-variant/20 hover:bg-surface-container/50">
                              <td className="p-4 font-mono font-bold text-sm">#{order.id}</td>
                              <td className="p-4 text-sm opacity-80">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</td>
                              <td className="p-4"><div className="font-bold">{order.customerName}</div><div className="text-xs opacity-60">{order.email}</div></td>
                              <td className="p-4 font-bold">{order.totalAmount} Kč</td>
                              <td className="p-4">
                                <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className={`text-sm px-3 py-1 rounded-full font-bold outline-none cursor-pointer ${order.status === 'Nová' ? 'bg-blue-100 text-blue-800' : order.status === 'Zaplacená' ? 'bg-green-100 text-green-800' : order.status === 'Zrušená' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                                  <option value="Nová">Nová</option><option value="Zaplacená">Zaplacená</option><option value="Odeslaná">Odeslaná</option><option value="Zrušená">Zrušená</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <button onClick={() => fetchOrderDetails(order)} className="text-[#765a17] hover:underline font-bold text-sm">Detail</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOrders.length === 0 && <div className="p-8 text-center opacity-60 italic">Žádné objednávky.</div>}
                    </div>
                 </div>
               )}

               {/* PRODUCTS TAB */}
               {activeTab === 'products' && (
                 <div>
                   <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 mb-8 shadow-sm">
                     <h3 className="text-xl font-bold mb-4">{editingProductId ? 'Upravit produkt' : 'Přidat nový produkt'}</h3>
                     <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><label className="text-sm font-semibold opacity-70">Název</label><input required className="w-full p-2 rounded bg-surface-container border-none" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Cena (Kč)</label><input required type="number" className="w-full p-2 rounded bg-surface-container border-none" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Kategorie</label><input required className="w-full p-2 rounded bg-surface-container border-none" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Sklad (ks)</label><input required type="number" className="w-full p-2 rounded bg-surface-container border-none" value={newProduct.stock} onChange={e=>setNewProduct({...newProduct, stock: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Slug (URL adresa, volitelné)</label><input className="w-full p-2 rounded bg-surface-container border-none" value={newProduct.slug} onChange={e=>setNewProduct({...newProduct, slug: e.target.value})} placeholder="yogi-tea-detox" /></div>
                       <div className="md:col-span-2"><label className="text-sm font-semibold opacity-70">Popis (HTML)</label><textarea required className="w-full p-2 rounded bg-surface-container border-none h-24" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} /></div>
                       <div className="md:col-span-2 flex items-center gap-4">
                         <div className="flex-1"><label className="text-sm font-semibold opacity-70">Obrázek (URL nebo nahrát)</label><div className="flex gap-2"><input className="flex-1 p-2 rounded bg-surface-container border-none" value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} /><input type="file" onChange={handleImageUpload} className="text-sm" /></div></div>
                         <label className="flex items-center gap-2 font-bold mt-6"><input type="checkbox" checked={newProduct.is_hero} onChange={e=>setNewProduct({...newProduct, is_hero: e.target.checked})} className="w-5 h-5 accent-[#765a17]" /> Top produkt</label>
                       </div>
                       <div className="md:col-span-2 pt-4 flex gap-4">
                         <button type="submit" className="bg-[#765a17] text-white px-6 py-2 rounded-lg font-bold">{editingProductId ? 'Uložit změny' : 'Přidat produkt'}</button>
                         {editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false, slug: ''}); }} className="bg-surface-variant px-6 py-2 rounded-lg font-bold">Zrušit úpravy</button>}
                       </div>
                     </form>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {products.map(p => (
                       <div key={p.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col">
                         {p.image && <img src={p.image} className="w-full h-40 object-cover rounded-lg mb-4" />}
                         <div className="flex justify-between items-start mb-2"><h4 className="font-bold">{p.name}</h4><span className="font-bold text-[#765a17]">{p.price} Kč</span></div>
                         <p className="text-xs opacity-60 mb-4 line-clamp-2">{p.description}</p>
                         <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/20">
                           <span className={`text-xs font-bold px-2 py-1 rounded ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.stock} ks</span>
                           <div className="flex gap-2">
                             <button onClick={() => { setEditingProductId(p.id); setNewProduct({ name: p.name, price: p.price, category: p.category, description: p.description, image: p.image, stock: p.stock, is_hero: p.is_hero === 1, slug: p.slug || '' }); window.scrollTo(0,0); }} className="text-blue-600 hover:underline text-sm font-bold">Upravit</button>
                             <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline text-sm font-bold">Smazat</button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* COUPONS TAB */}
               {activeTab === 'coupons' && (
                 <div>
                   <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 mb-8 shadow-sm">
                     <h3 className="text-xl font-bold mb-4">Přidat nový kupón</h3>
                     <form onSubmit={saveCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div><label className="text-sm font-semibold opacity-70">Kód (př. SLEVA20)</label><input required className="w-full p-2 rounded bg-surface-container border-none uppercase" value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Typ slevy</label><select className="w-full p-2 rounded bg-surface-container border-none" value={newCoupon.discount_type} onChange={e=>setNewCoupon({...newCoupon, discount_type: e.target.value})}><option value="percent">Procenta (%)</option><option value="fixed">Pevná částka (Kč)</option></select></div>
                       <div><label className="text-sm font-semibold opacity-70">Hodnota slevy</label><input required type="number" className="w-full p-2 rounded bg-surface-container border-none" value={newCoupon.discount_value} onChange={e=>setNewCoupon({...newCoupon, discount_value: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Limit použití (kolikrát lze celkem zadat)</label><input type="number" placeholder="Neomezeně" className="w-full p-2 rounded bg-surface-container border-none" value={newCoupon.usage_limit} onChange={e=>setNewCoupon({...newCoupon, usage_limit: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Platnost OD</label><input type="datetime-local" className="w-full p-2 rounded bg-surface-container border-none" value={newCoupon.valid_from} onChange={e=>setNewCoupon({...newCoupon, valid_from: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Platnost DO</label><input type="datetime-local" className="w-full p-2 rounded bg-surface-container border-none" value={newCoupon.valid_until} onChange={e=>setNewCoupon({...newCoupon, valid_until: e.target.value})} /></div>
                       <div className="md:col-span-3 pt-2">
                         <button type="submit" className="bg-[#765a17] text-white px-6 py-2 rounded-lg font-bold">Vytvořit kupón</button>
                       </div>
                     </form>
                   </div>
                   <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-surface-container text-sm uppercase opacity-70">
                         <tr><th className="p-4 font-semibold">Kód</th><th className="p-4 font-semibold">Sleva</th><th className="p-4 font-semibold">Platnost</th><th className="p-4 font-semibold">Použití</th><th className="p-4 font-semibold">Akce</th></tr>
                       </thead>
                       <tbody>
                         {coupons.map(c => (
                           <tr key={c.id} className="border-t border-outline-variant/20">
                             <td className="p-4 font-mono font-bold">{c.code}</td>
                             <td className="p-4 font-bold text-green-700">{c.discount_value} {c.discount_type === 'percent' ? '%' : 'Kč'}</td>
                             <td className="p-4 text-sm opacity-80">
                               {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : 'Kdykoliv'} - {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Napořád'}
                             </td>
                             <td className="p-4 text-sm font-bold">{c.times_used} / {c.usage_limit || '∞'}</td>
                             <td className="p-4"><button onClick={() => deleteCoupon(c.id)} className="text-red-600 hover:underline font-bold text-sm">Smazat</button></td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}

               {/* RESERVATIONS TAB */}
               {activeTab === 'reservations' && (
                 <div className="space-y-8">
                   {/* Management of Slots */}
                   <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                     <h3 className="text-xl font-bold mb-4">Vypsat nový termín</h3>
                     <form onSubmit={saveSlot} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                       <div className="md:col-span-2"><label className="text-sm font-semibold opacity-70">Název události</label><input required placeholder="např. Jóga, Masáž" className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.title} onChange={e=>setNewSlot({...newSlot, title: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Datum</label><input required type="date" className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.date} onChange={e=>setNewSlot({...newSlot, date: e.target.value})} /></div>
                       <div><label className="text-sm font-semibold opacity-70">Čas (např. 16:00)</label><input required type="time" className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.timeSlot} onChange={e=>setNewSlot({...newSlot, timeSlot: e.target.value})} /></div>
                       <div className="md:col-span-2"><label className="text-sm font-semibold opacity-70">Kapacita</label><input required type="number" min="1" className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.capacity} onChange={e=>setNewSlot({...newSlot, capacity: e.target.value})} /></div>
                       
                       <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                         <div><label className="text-sm font-semibold opacity-70">Opakování</label><select className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.repeatFrequency} onChange={e=>setNewSlot({...newSlot, repeatFrequency: e.target.value})}><option value="none">Bez opakování</option><option value="daily">Denně</option><option value="weekly">Týdně</option><option value="biweekly">Jednou za 14 dní</option><option value="monthly">Měsíčně</option></select></div>
                         {newSlot.repeatFrequency !== 'none' && (
                            <div><label className="text-sm font-semibold opacity-70">Kolikrát zopakovat (včetně prvního)</label><input required type="number" min="1" max="52" className="w-full p-2 rounded bg-surface-container border-none" value={newSlot.repeatCount} onChange={e=>setNewSlot({...newSlot, repeatCount: e.target.value})} /></div>
                         )}
                       </div>

                       <div className="md:col-span-6 pt-2">
                         <button type="submit" className="bg-[#765a17] text-white px-6 py-2 rounded-lg font-bold">Vypsat termín(y)</button>
                       </div>
                     </form>
                   </div>
                   
                   {/* List of Slots */}
                   <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-surface-container text-sm uppercase opacity-70">
                         <tr><th className="p-4 font-semibold">Událost</th><th className="p-4 font-semibold">Datum a čas</th><th className="p-4 font-semibold">Kapacita</th><th className="p-4 font-semibold">Akce</th></tr>
                       </thead>
                       <tbody>
                         {slots.map(s => (
                           <tr key={s.id} className="border-t border-outline-variant/20">
                             <td className="p-4 font-bold">{s.title}</td>
                             <td className="p-4">{new Date(s.date).toLocaleDateString('cs-CZ')} v {s.timeSlot}</td>
                             <td className="p-4 font-bold">{s.taken} / {s.capacity} obsazeno</td>
                             <td className="p-4"><button onClick={() => deleteSlot(s.id)} className="text-red-600 hover:underline font-bold text-sm">Smazat</button></td>
                           </tr>
                         ))}
                         {slots.length === 0 && <tr><td colSpan="4" className="p-4 text-center opacity-60">Žádné vypsané termíny.</td></tr>}
                       </tbody>
                     </table>
                   </div>

                   <h3 className="text-2xl font-headline italic mt-8 mb-4">Seznam rezervací</h3>
                   <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-surface-container text-sm uppercase opacity-70">
                         <tr><th className="p-4 font-semibold">Zákazník</th><th className="p-4 font-semibold">Událost</th><th className="p-4 font-semibold">Termín</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Akce</th></tr>
                       </thead>
                       <tbody>
                         {reservationsList.map(r => (
                           <tr key={r.id} className="border-t border-outline-variant/20 hover:bg-surface-container/50">
                             <td className="p-4"><div className="font-bold">{r.name}</div><div className="text-xs opacity-60">{r.email}</div></td>
                             <td className="p-4 font-bold">{r.slotTitle || 'Neznámá/Stará událost'}</td>
                             <td className="p-4">{new Date(r.date).toLocaleDateString('cs-CZ')} v {r.timeSlot}</td>
                             <td className="p-4">
                               <span className={`text-sm px-3 py-1 rounded-full font-bold ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                 {r.status === 'pending' ? 'Čeká na schválení' : r.status === 'confirmed' ? 'Potvrzeno' : 'Zrušeno'}
                               </span>
                             </td>
                             <td className="p-4 flex gap-2">
                               {r.status === 'pending' && (
                                 <>
                                   <button onClick={() => updateReservationStatus(r.id, 'confirmed')} className="text-green-700 hover:underline font-bold text-sm">Schválit</button>
                                   <button onClick={() => updateReservationStatus(r.id, 'cancelled')} className="text-red-600 hover:underline font-bold text-sm">Zamítnout</button>
                                 </>
                               )}
                               {r.status === 'confirmed' && (
                                   <button onClick={() => updateReservationStatus(r.id, 'cancelled')} className="text-red-600 hover:underline font-bold text-sm">Zrušit</button>
                               )}
                             </td>
                           </tr>
                         ))}
                         {reservationsList.length === 0 && <tr><td colSpan="5" className="p-4 text-center opacity-60">Zatím žádné rezervace.</td></tr>}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}

               {/* EMAILS TAB */}
               {activeTab === 'emails' && (
                 <div>
                   <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                     <h3 className="text-xl font-bold mb-4">Správa e-mailových šablon</h3>
                     <p className="opacity-70 mb-4 text-sm">
                       Zde můžete upravit HTML šablonu, která se používá jako "obálka" pro všechny odchozí e-maily (objednávky, kontaktní formulář, rezervace).
                       Nezapomeňte v šabloně ponechat zástupný znak <strong>{'{{{CONTENT}}}'}</strong> tam, kde se má zobrazit samotný text e-mailu.
                     </p>
                     <form onSubmit={saveEmailTemplate} className="space-y-4">
                       <div>
                         <label className="block text-sm font-semibold opacity-70 mb-2">Výchozí HTML šablona</label>
                         <textarea
                           required
                           className="w-full p-4 rounded-lg bg-surface-container border-none h-[400px] font-mono text-sm leading-relaxed"
                           value={emailTemplate}
                           onChange={e => setEmailTemplate(e.target.value)}
                           spellCheck={false}
                         />
                       </div>
                       <div className="pt-2">
                         <button type="submit" className="bg-[#765a17] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#614a13] transition-colors">
                           Uložit šablonu
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
               )}
             </>
           )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-surface rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-headline italic">Detail objednávky #{selectedOrderDetails.id}</h2>
                <button onClick={() => setSelectedOrderDetails(null)} className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-full hover:bg-surface-variant"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                 <div><p className="text-sm opacity-60 uppercase font-bold tracking-wider mb-1">Zákazník</p><p className="font-bold">{selectedOrderDetails.customerName}</p><p className="opacity-80">{selectedOrderDetails.email}</p></div>
                 <div><p className="text-sm opacity-60 uppercase font-bold tracking-wider mb-1">Adresa</p><p className="whitespace-pre-wrap">{selectedOrderDetails.address || 'Nevyplněno'}</p></div>
                 <div><p className="text-sm opacity-60 uppercase font-bold tracking-wider mb-1">Vytvořeno</p><p>{new Date(selectedOrderDetails.createdAt).toLocaleString('cs-CZ')}</p></div>
                 <div><p className="text-sm opacity-60 uppercase font-bold tracking-wider mb-1">Status</p><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">{selectedOrderDetails.status}</span></div>
              </div>
              <h3 className="font-bold text-lg mb-4 border-b border-outline-variant/20 pb-2">Položky</h3>
              <div className="space-y-4 mb-6">
                 {selectedOrderDetails.items?.map(i => (
                   <div key={i.id} className="flex gap-4 items-center bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                     {i.image && <img src={i.image} className="w-16 h-16 object-cover rounded shadow-sm" />}
                     <div className="flex-1"><h4 className="font-bold leading-tight">{i.name}</h4><p className="text-sm opacity-70">{i.quantity} ks × {i.price} Kč</p></div>
                     <span className="font-bold text-lg">{(i.quantity * i.price).toLocaleString('cs-CZ')} Kč</span>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30">
                <span className="text-lg opacity-80">Celková částka po slevách</span>
                <span className="text-3xl font-bold text-[#765a17]">{selectedOrderDetails.totalAmount.toLocaleString('cs-CZ')} Kč</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
