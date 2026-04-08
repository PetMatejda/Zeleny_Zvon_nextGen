import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Zjednodušený stav pro přidání produktu
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const fetchOrders = () => {
    fetch('http://localhost:3001/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  };

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    fetch(`http://localhost:3001/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(() => fetchOrders());
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProductName, price: parseInt(newProductPrice), category: 'Ostatní' })
    }).then(() => {
      fetchProducts();
      setNewProductName('');
      setNewProductPrice('');
    });
  };

  return (
    <div style={{ background: 'var(--surface-container-low)', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Administrace Zelený zvon</h1>
        
        <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
          {/* Objednávky */}
          <div className="card" style={{ background: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Objednávky</h2>
            {orders.length === 0 ? <p>Zatím žádné objednávky.</p> : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--surface-container)' }}>
                    <th style={{ padding: '0.5rem 0' }}>Zákazník</th>
                    <th style={{ padding: '0.5rem 0' }}>Částka</th>
                    <th style={{ padding: '0.5rem 0' }}>Stav</th>
                    <th style={{ padding: '0.5rem 0' }}>Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--surface-container)' }}>
                      <td style={{ padding: '0.75rem 0' }}>
                        {o.customerName}<br/>
                        <small style={{ color: 'var(--on-surface-variant)' }}>{new Date(o.createdAt).toLocaleString('cs-CZ')}</small>
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>{o.totalAmount} Kč</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span className="chip" style={{ background: o.status === 'Vyřízeno' ? 'var(--primary-fixed)' : 'var(--secondary-container)' }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>
                        {o.status !== 'Vyřízeno' && (
                          <button onClick={() => handleUpdateStatus(o.id, 'Vyřízeno')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Označit vyřízeno</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Produkty */}
          <div className="card" style={{ background: 'white' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Správa produktů</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input required type="text" placeholder="Název" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="ghost-border" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem' }} />
              <input required type="number" placeholder="Cena (Kč)" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="ghost-border" style={{ width: '100px', padding: '0.75rem', borderRadius: '0.5rem' }} />
              <button type="submit" className="btn-primary">Přidat</button>
            </form>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--surface-container)' }}>
                    <th style={{ padding: '0.5rem 0' }}>Produkt</th>
                    <th style={{ padding: '0.5rem 0' }}>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--surface-container)' }}>
                      <td style={{ padding: '0.75rem 0' }}>{p.name}</td>
                      <td style={{ padding: '0.75rem 0' }}>{p.price} Kč</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
