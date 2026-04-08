import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        const p = data.find(item => item.id.toString() === id);
        setProduct(p);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="container section-padding">Načítám...</div>;

  return (
    <div>
      <section className="section-padding">
        <div className="container grid grid-cols-2" style={{ alignItems: 'center' }}>
          <div>
             <div style={{ background: 'var(--surface-container-high)', borderRadius: '1.5rem', paddingBottom: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
                {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Fotografie produktu'}
              </div>
            </div>
          </div>
          <div style={{ paddingLeft: '2rem' }}>
            <span className="chip" style={{ marginBottom: '1rem' }}>{product.category}</span>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>{product.name}</h1>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--on-primary-container)', marginBottom: '2rem' }}>{product.price} Kč</p>
            
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.8 }}>
              {product.description || "Tento vzácný kousek pro Vaše zdraví a pohodu pochází pouze z přírodních a udržitelných zdrojů. Dokonale zapadá do denní praxe uvědomění a péče o tělo i rozvoj duše."}
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '0.75rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>-</button>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center' }}>{quantity}</div>
                <button onClick={() => setQuantity(q => q + 1)} style={{ padding: '0.75rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>+</button>
              </div>
              <button className="btn-primary" onClick={() => addToCart(product, quantity)} style={{ flex: 1 }}>Přidat do košíku</button>
            </div>

            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <Link to="/eshop" style={{ color: 'var(--on-surface-variant)', textDecoration: 'underline' }}>&larr; Zpět do E-Shopu</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
