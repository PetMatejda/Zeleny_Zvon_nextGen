export const dynamic = 'force-dynamic';
import { getDb } from '../../../lib/db.js';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

async function getProduct(slug) {
  return new Promise((resolve) => {
    const db = getDb();
    db.get('SELECT * FROM products WHERE slug = ?', [slug], (err, row) => {
      resolve(row || null);
    });
  });
}

// generateMetadata — sets <title>, <meta description> and Open Graph server-side
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produkt nenalezen | Zelený Zvon' };

  return {
    title: `${product.name} | Zelený Zvon`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
      url: `https://www.zelenyzvon.cz/eshop/${product.slug || product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // JSON-LD — built server-side, rendered in the initial HTML — bots see this
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'DietarySupplement',
    name: product.name,
    url: `https://www.zelenyzvon.cz/eshop/${product.slug || product.id}`,
    image: product.image,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: 'CZK',
      availability: 'https://schema.org/InStock',
      url: `https://www.zelenyzvon.cz/eshop/${product.slug || product.id}`,
    },
  };

  return (
    <>
      {/* JSON-LD injected into <head> at render time — visible to all bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Interactive client component for cart/quantity UI */}
      <ProductDetailClient product={product} />
    </>
  );
}
