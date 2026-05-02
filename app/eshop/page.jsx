import { getDb } from '../../lib/db.js';
import EShopClient from './EShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'E-shop pro duši | Zelený Zvon',
  description: 'Vybrané esence a produkty vytvořené k navrácení vnitřní rovnováhy a harmonie do vašeho každodenního života.',
};

// Fetch products server-side so bots see them
async function getProducts() {
  return new Promise((resolve) => {
    const db = getDb();
    db.all('SELECT * FROM products', [], (err, rows) => {
      console.log('GET_PRODUCTS_ESHOP_PAGE - ERROR:', err);
      console.log('GET_PRODUCTS_ESHOP_PAGE - COUNT:', rows ? rows.length : 0);
      resolve(err ? [] : rows);
    });
  });
}

export default async function EShopPage() {
  const products = await getProducts();
  console.log('ESHOP_PAGE_RENDER - products count:', products.length);
  return <EShopClient initialProducts={products} />;
}
