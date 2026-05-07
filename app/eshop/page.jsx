import { db } from '../../lib/db-drizzle.js';
import { products } from '../../lib/schema.js';
import EShopClient from './EShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'E-shop pro duši | Zelený Zvon',
  description: 'Vybrané esence a produkty vytvořené k navrácení vnitřní rovnováhy a harmonie do vašeho každodenního života.',
};

// Fetch products server-side so bots see them
async function getProducts() {
  try {
    const allProducts = await db.select().from(products);
    return allProducts;
  } catch (err) {
    console.error('GET_PRODUCTS_ESHOP_PAGE - ERROR:', err);
    return [];
  }
}

export default async function EShopPage() {
  const products = await getProducts();
  console.log('ESHOP_PAGE_RENDER - products count:', products.length);
  return <EShopClient initialProducts={products} />;
}
