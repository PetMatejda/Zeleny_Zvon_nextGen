/**
 * Import skript: schema.html → SQLite databáze
 * Spuštění: node import-schema-products.js
 *
 * Co dělá:
 *  1. Přečte schema.html a extrahuje JSON-LD pole produktů
 *  2. Vymaže stávající testovací produkty
 *  3. Přidá sloupec `slug` do tabulky products (pokud chybí)
 *  4. Automaticky odvodí kategorii z názvu/popisu
 *  5. Naimportuje všechny produkty do SQLite
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── 1. Načtení a parsování schema.html ──────────────────────────────────────

const schemaHtml = readFileSync(join(__dirname, 'schema.html'), 'utf-8');
const match = schemaHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);

if (!match) {
  console.error('❌ Nepodařilo se najít JSON-LD script tag v schema.html');
  process.exit(1);
}

let rawProducts;
try {
  rawProducts = JSON.parse(match[1]);
} catch (e) {
  console.error('❌ Nepodařilo se parsovat JSON ze schema.html:', e.message);
  process.exit(1);
}

console.log(`📦 Nalezeno ${rawProducts.length} produktů v schema.html`);

// ─── 2. Pomocné funkce ───────────────────────────────────────────────────────

/** Extrahuje URL slug z pole url (poslední část path) */
function extractSlug(url) {
  if (!url) return null;
  return url.split('/').pop() || null;
}

/** Automaticky odvodí kategorii z názvu a popisu produktu */
function deriveCategory(name, description) {
  const n = name.toUpperCase();
  const d = (description || '').toUpperCase();

  // Fyzické pomůcky a vybavení
  if (/IPLIKÁTOR|PODLOŽKA|PONOŽKY|BUBEN|DIFUZÉR|LAHEV|RUČNÍK|MÍČ|MÍČEK/.test(n))
    return 'Pomůcky';

  // Kosmetika
  if (/MÝDLO|KRÉM|SÉRUM|ŠAMPÓN/.test(n))
    return 'Kosmetika';

  // CBD produkty
  if (/CBD/.test(n))
    return 'CBD';

  // Esenciální oleje BEWIT (ml ve jméně, nejsou kapsle)
  if (n.includes('BEWIT') && /\d\s?ML/.test(n) && !n.includes('KAPSLÍ') && !n.includes('KULIČEK'))
    return 'Esenciální oleje';

  // Probiotika
  if (/PROBIOTIKA/.test(n))
    return 'Probiotika';

  // Vitamíny
  if (/VITAMÍN|VITAMIN/.test(n))
    return 'Vitamíny';

  // Houbové přípravky — MycoMedica a spol.
  if (/MYCOMEDICA|REISHI|CHAGA|HERICIUM|CORDYCEPS|MYCO/.test(n))
    return 'Houby & adaptogeny';

  // Výchozí kategorie
  return 'Doplňky stravy';
}

// ─── 3. Transformace produktů ────────────────────────────────────────────────

const products = rawProducts.map((p) => {
  // Odstraní hvězdičky na konci názvu (používané jako interní označení)
  const name = (p.name || '').replace(/\*+\s*$/, '').trim();

  // Cena — z pole offers.price, zaokrouhlená na celé koruny
  const price = p.offers?.price ? Math.round(parseFloat(p.offers.price)) : 0;

  // Obrázek — schema.html může mít více URL oddělených čárkou; bereme první
  const images = p.image ? p.image.split(',') : [];
  const image = images[0]?.trim() || '';

  const description = p.description || '';
  const slug = extractSlug(p.url);
  const category = deriveCategory(name, description);

  return { name, price, category, description, image, slug };
});

console.log('📊 Ukázka kategorií:');
const categoryCounts = {};
products.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} produktů`);
});

// ─── 4. Uložení do SQLite ────────────────────────────────────────────────────

const dbPath = process.env.DATABASE_PATH || join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Nepodařilo se připojit k databázi:', err.message);
    process.exit(1);
  }
  console.log(`\n🗄️  Připojeno k databázi: ${dbPath}`);
});

db.serialize(() => {
  // Přidání sloupce slug (bezpečně — selže tiše, pokud už existuje)
  db.run('ALTER TABLE products ADD COLUMN slug TEXT', (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.warn('⚠️  Varování při přidávání sloupce slug:', err.message);
    } else if (!err) {
      console.log('✅ Sloupec `slug` přidán do tabulky products');
    }
  });

  // Smazání stávajících produktů
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('❌ Chyba při mazání produktů:', err.message);
      return;
    }
    // Resetování auto-increment čítače
    db.run("DELETE FROM sqlite_sequence WHERE name='products'");
    console.log('🗑️  Stávající produkty smazány');

    // Hromadný insert
    const stmt = db.prepare(
      'INSERT INTO products (name, price, category, description, image, stock, is_hero, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    products.forEach((p) => {
      stmt.run(p.name, p.price, p.category, p.description, p.image, 10, 0, p.slug);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('❌ Chyba při importu produktů:', err.message);
      } else {
        console.log(`\n✅ Import dokončen — ${products.length} produktů úspěšně naimportováno!`);
        console.log('💡 Spusťte server a zkontrolujte produkty v admin panelu.');
      }
      db.close();
    });
  });
});
