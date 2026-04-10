import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form for new product
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false
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
      const url = activeTab === 'orders' ? `${API_URL}/orders` : `${API_URL}/products`;
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
      else setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
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
        alert('Produkt vložena');
        setNewProduct({ name: '', price: '', category: '', description: '', image: '', stock: 10, is_hero: false });
        fetchData(); // refresh
      } else {
        alert('Chyba při ukládání');
      }
    } catch (e) {
      console.error(e);
    }
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
                     <button className="text-sm text-[#765a17] hover:underline font-bold">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           <div>
              <div className="bg-surface-container-low p-6 rounded-2xl sticky top-24">
                <h3 className="font-notoserif text-2xl italic mb-6">Přidat nový produkt</h3>
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
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-1">URL Obrázku</label>
                      <input type="text" placeholder="https://" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-2 rounded bg-[#faf9f4] border-none text-xs" />
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
                     Vložit produkt do nabídky
                   </button>
                </form>
              </div>
           </div>
        </div>
      )}
    </main>
  );
}
