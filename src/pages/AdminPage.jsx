import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'coupons'
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Order detail state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Form for products
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false
  });
  
  // Form for coupons
  const [newCoupon, setNewCoupon] = useState({
    code: '', discount_type: 'percent', discount_value: '', usage_limit: '', valid_from: '', valid_until: ''
  });

  const handleLoginSuccess = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
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
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/orders`;
      if (activeTab === 'products') url = `${API_URL}/products`;
      else if (activeTab === 'coupons') url = `${API_URL}/coupons`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
         handleLogout();
         return;
      }
      const data = await res.json();
      if (activeTab === 'orders') setOrders(data);
      else if (activeTab === 'products') setProducts(data);
      else if (activeTab === 'coupons') setCoupons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (order) => {
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/items`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setSelectedOrderDetails({ ...order, items: await res.json() });
    } catch(e) { console.error(e); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const backendOrigin = API_URL.replace('/api', '');
        setNewProduct({...newProduct, image: backendOrigin + data.url});
      } else {
        alert('Nahrávání selhalo.');
      }
    } catch(err) { console.error(err); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
      const method = editingProductId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
           ...newProduct,
           price: Number(newProduct.price),
           stock: Number(newProduct.stock)
        })
      });
      if (res.ok) {
        alert(editingProductId ? 'Produkt upraven' : 'Produkt vložen');
        setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false });
        setEditingProductId(null);
        fetchData(); // refresh
      } else {
        alert('Chyba při ukládání');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    setNewProduct({ ...p });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Opravdu chcete tento produkt smazat?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...newCoupon,
          discount_value: Number(newCoupon.discount_value)
        })
      });
      if (res.ok) {
        alert('Kupón vytvořen');
        setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', usage_limit: '', valid_from: '', valid_until: '' });
        fetchData();
      } else {
         alert('Chyba při ukládání kupónu');
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Opravdu chcete tento kupón smazat?')) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
       await fetch(`${API_URL}/orders/${id}/status`, {
         method: 'PATCH',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ status })
       });
       fetchData();
    } catch(e) {
       console.error(e);
    }
  }

  if (!token) {
    return (
      <main className="max-w-md mx-auto px-8 pt-20 pb-32 font-plusjakarta text-center flex flex-col items-center">
        <h1 className="text-3xl font-headline italic mb-8">Administrace</h1>
        <p className="mb-8 opacity-70">Tato sekce je určena pouze pro správce e-shopu Zelený Zvon. Pro přístup se prosím přihlaste pomocí svého přiděleného Google účtu.</p>
        
        <div className="bg-surface-container-low p-8 rounded-2xl w-full flex justify-center border border-[#765a17]/20 shadow-md">
           <GoogleLogin
             onSuccess={handleLoginSuccess}
             onError={() => setError('Přihlášení se nezdařilo')}
           />
        </div>
        {error && <p className="text-red-500 mt-6 bg-red-100 p-4 rounded-lg font-bold">{error}</p>}
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-8 pt-8 pb-24 font-plusjakarta">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline italic">Správa E-shopu</h1>
        <button onClick={handleLogout} className="px-6 py-2 bg-red-100 text-red-800 rounded-full font-bold hover:bg-red-200 transition-colors">Odhlásit se</button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#765a17]/20 pb-4">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'orders' ? 'bg-[#765a17] text-white' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
        >
          Objednávky
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'products' ? 'bg-[#765a17] text-white' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
        >
          Produkty
        </button>
        <button 
          onClick={() => setActiveTab('coupons')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'coupons' ? 'bg-[#765a17] text-white' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
        >
          Kupóny
        </button>
      </div>

      {loading && <p className="text-center py-20 opacity-50">Načítám data...</p>}

      {!loading && activeTab === 'orders' && (
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#765a17]/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-sm uppercase tracking-wider opacity-80">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Zákazník</th>
                <th className="p-4 font-bold">E-mail</th>
                <th className="p-4 font-bold">Částka</th>
                <th className="p-4 font-bold">Datum</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Akce</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center opacity-50">Zatím nejsou žádné objednávky.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-t border-[#765a17]/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 font-mono font-bold">#{o.id}</td>
                  <td className="p-4">{o.customerName}</td>
                  <td className="p-4">{o.email}</td>
                  <td className="p-4 font-bold">{o.totalAmount} Kč</td>
                  <td className="p-4 text-sm opacity-80">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-4 flex gap-2">
                     <select 
                       value={o.status} 
                       onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                       className="p-1 rounded bg-[#faf9f4] border border-[#765a17]/30 text-sm font-semibold"
                     >
                       <option value="Nová">Nová</option>
                       <option value="Zaplaceno">Zaplaceno</option>
                       <option value="Odesláno">Odesláno</option>
                       <option value="Storno">Storno</option>
                     </select>
                  </td>
                  <td className="p-4">
                     <button onClick={() => fetchOrderDetails(o)} className="text-sm text-[#765a17] hover:underline font-bold">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrderDetails && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-surface-container-lowest w-full max-w-lg p-6 rounded-2xl shadow-xl">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-headline italic">Detail Obj. #{selectedOrderDetails.id}</h2>
                 <button onClick={() => setSelectedOrderDetails(null)} className="text-xl font-bold opacity-50 hover:opacity-100">&times;</button>
               </div>
               
               <div className="mb-4 pb-4 border-b border-[#765a17]/20">
                  <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">Údaje zákazníka</h3>
                  <p className="font-bold">{selectedOrderDetails.customerName}</p>
                  <p className="text-sm">{selectedOrderDetails.email}</p>
                  {selectedOrderDetails.address && (
                     <div className="mt-2 p-3 bg-[#faf9f4] rounded-lg border border-[#765a17]/20 font-mono text-sm whitespace-pre-line text-[#1b1c19]">
                        {selectedOrderDetails.address}
                     </div>
                  )}
               </div>

               <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-3">Položky</h3>
               <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                 {selectedOrderDetails.items.map(item => (
                   <div key={item.id} className="flex gap-4 items-center bg-surface-container-low p-3 rounded-lg border border-[#765a17]/10">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm opacity-70">{item.price} Kč &times; {item.quantity} ks</p>
                      </div>
                      <p className="font-bold text-[#765a17]">{item.price * item.quantity} Kč</p>
                   </div>
                 ))}
               </div>
            </div>
         </div>
      )}

      {!loading && activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#765a17]/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-sm uppercase tracking-wider opacity-80">
                    <th className="p-4 font-bold">Produkt</th>
                    <th className="p-4 font-bold">Cena</th>
                    <th className="p-4 font-bold">Skladem</th>
                    <th className="p-4 font-bold">Doporučeno</th>
                    <th className="p-4 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t border-[#765a17]/10 hover:bg-surface-container-low/50">
                      <td className="p-4 flex items-center gap-3">
                         <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="w-10 h-10 object-cover rounded" />
                         <div>
                           <p className="font-bold text-sm">{p.name}</p>
                           <p className="text-xs opacity-60">{p.category}</p>
                         </div>
                      </td>
                      <td className="p-4 font-bold">{p.price} Kč</td>
                      <td className="p-4">{p.stock} ks</td>
                      <td className="p-4">
                         {p.is_hero === 1 && <span className="bg-[#765a17] text-white px-2 py-1 rounded text-xs">Ano</span>}
                      </td>
                      <td className="p-4 flex gap-2">
                         <button onClick={() => handleEditProduct(p)} className="text-xs font-bold text-[#765a17] hover:underline">Úprava</button>
                         <button onClick={() => handleDeleteProduct(p.id)} className="text-xs font-bold text-red-600 hover:underline">Smazat</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           <div>
              <div className="bg-surface-container-low p-6 rounded-2xl sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-notoserif text-2xl italic">{editingProductId ? 'Upravit produkt' : 'Přidat nový produkt'}</h3>
                  {editingProductId && (
                     <button type="button" onClick={() => { setEditingProductId(null); setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false }); }} className="text-xs uppercase font-bold opacity-60 hover:opacity-100">Zrušit</button>
                  )}
                </div>
                <form onSubmit={handleAddProduct} className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Název</label>
                      <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Cena (Kč)</label>
                        <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Skladem</label>
                        <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                     </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Kategorie</label>
                      <input required type="text" placeholder="např. Aura spreje" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Obrázek (URL nebo nahrát)</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none text-xs" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs p-1" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Popis</label>
                      <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none text-sm min-h-[80px]" />
                   </div>
                   <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="hero" checked={newProduct.is_hero} onChange={e => setNewProduct({...newProduct, is_hero: e.target.checked})} className="w-4 h-4 text-[#765a17] focus:ring-[#765a17] border-gray-300 rounded" />
                      <label htmlFor="hero" className="font-bold text-sm">Označit jako "Doporučujeme" (Hero)</label>
                   </div>
                   
                   <button type="submit" className="w-full py-3 bg-[#765a17] text-white font-bold rounded-lg hover:bg-[#5b4300] transition-colors mt-6">
                     {editingProductId ? 'Uložit změny' : 'Vložit produkt do nabídky'}
                   </button>
                </form>
              </div>
            </div>
         </div>
       )}

       {!loading && activeTab === 'coupons' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#765a17]/10">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-surface-container-low text-sm uppercase tracking-wider opacity-80">
                     <th className="p-4 font-bold">Kód</th>
                     <th className="p-4 font-bold">Hodnota</th>
                     <th className="p-4 font-bold">Platnost</th>
                     <th className="p-4 font-bold">Využito</th>
                     <th className="p-4 font-bold">Akce</th>
                   </tr>
                 </thead>
                 <tbody>
                   {coupons.map(c => (
                     <tr key={c.id} className="border-t border-[#765a17]/10 hover:bg-surface-container-low/50">
                       <td className="p-4 font-bold font-mono">{c.code}</td>
                       <td className="p-4 font-bold">{c.discount_type === 'percent' ? `${c.discount_value} %` : `${c.discount_value} Kč`}</td>
                       <td className="p-4 text-xs opacity-80">
                          {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : 'Nyní'} - {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Neomezeně'}
                       </td>
                       <td className="p-4">{c.times_used} {c.usage_limit ? `/ ${c.usage_limit}` : ''}</td>
                       <td className="p-4">
                          <button onClick={() => handleDeleteCoupon(c.id)} className="text-xs font-bold text-red-600 hover:underline">Smazat</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div>
               <div className="bg-surface-container-low p-6 rounded-2xl sticky top-24">
                 <h3 className="font-notoserif text-2xl italic mb-6">Nový kupón</h3>
                 <form onSubmit={handleAddCoupon} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Kód</label>
                       <input required type="text" placeholder="SLEVA20" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full p-2 rounded bg-[#faf9f4] border-none font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Typ slevy</label>
                         <select value={newCoupon.discount_type} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none">
                            <option value="percent">Procenta</option>
                            <option value="fixed">Částka (Kč)</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Hodnota</label>
                         <input required type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                      </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Limit (počet použití)</label>
                       <input type="number" placeholder="Prázdné = neomezeno" value={newCoupon.usage_limit} onChange={e => setNewCoupon({...newCoupon, usage_limit: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Platnost Od</label>
                          <input type="datetime-local" value={newCoupon.valid_from} onChange={e => setNewCoupon({...newCoupon, valid_from: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Platnost Do</label>
                          <input type="datetime-local" value={newCoupon.valid_until} onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none" />
                       </div>
                    </div>
                    
                    <button type="submit" className="w-full py-3 bg-[#765a17] text-white font-bold rounded-lg hover:bg-[#5b4300] transition-colors mt-6">
                      Vytvořit kupón
                    </button>
                 </form>
               </div>
            </div>
         </div>
       )}
    </main>
  );
}
