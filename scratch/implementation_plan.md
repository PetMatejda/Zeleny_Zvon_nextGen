# Drizzle ORM Migration Plan pro E-shop

Cílem tohoto plánu je přepsat stávající čisté SQL dotazy (používající `sqlite3` a funkci `getDb()`) do Drizzle ORM. Tím se sjednotí práce s databází pro rezervační systém i e-shop, což výrazně usnadní budoucí automatizaci plateb a správu kódové základny.

## User Review Required

> [!WARNING]
> Tato změna se dotkne mnoha API endpointů a stránek e-shopu. Byly pečlivě zmapovány všechny soubory používající `getDb()`, ale po nasazení bude potřeba důkladně otestovat průchod košíkem a načítání produktů. Data v databázi zůstanou zachována, mění se pouze způsob, jakým k nim aplikace přistupuje.
> **Souhlasíte s tímto rozsahem úprav?**

## Proposed Changes

### 1. Definice Schématu (Drizzle)
Přidáme existující e-shopové tabulky do Drizzle schématu, aby přesně odpovídaly struktuře vytvořené dříve čistým SQL.

#### [MODIFY] lib/schema.js
Přidání nových exportů:
- `products`: id, name, price, category, description, image, stock, is_hero, slug
- `coupons`: id, code, discount_type, discount_value, valid_from, valid_until, usage_limit, times_used, is_active
- `orders`: id, customerName, email, address, totalAmount, status, createdAt, coupon_id
- `order_items`: id, orderId, productId, quantity

### 2. Konfigurace Drizzle
Aby Drizzle uměl generovat migrace i pro tyto "nové" (resp. nově mapované) tabulky.

#### [MODIFY] drizzle.config.js
- Odstranění `tablesFilter: ['reservations']`, aby Drizzle spravoval všechny tabulky v `lib/schema.js`.

### 3. Migrace Frontend Stránek
Přepis načítání produktů pro Server-Side Rendering (SSR).

#### [MODIFY] app/eshop/page.jsx
- Náhrada `getDb().all('SELECT * FROM products')` za Drizzle `db.select().from(products)`.

#### [MODIFY] app/eshop/[slug]/page.jsx
- Náhrada `getDb().get` za Drizzle `db.select().from(products).where(eq(products.slug, slug))`.

### 4. Migrace E-shop API (Products & Coupons)
Přepis rout pro administraci a načítání katalogu.

#### [MODIFY] app/api/products/route.js & app/api/products/[id]/route.js & app/api/products/by-slug/[slug]/route.js
- Přepis všech GET, POST, PUT, DELETE operací pro produkty z `db.run`/`db.all` na Drizzle metody.

#### [MODIFY] app/api/coupons/route.js & app/api/coupons/[id]/route.js & app/api/coupons/validate/route.js
- Přepis CRUD operací a validační logiky kupónů na Drizzle.

### 5. Migrace Objednávkového Systému (Nejkomplexnější část)
Přepis logiky pro vytvoření objednávky, která musí proběhnout v Drizzle transakci, a dalších rout pro stavy objednávek.

#### [MODIFY] app/api/orders/route.js
- Přepis `GET` pro načtení seznamu objednávek pro admina.
- Přepis `POST` pro vytvoření objednávky (zpracování kupónu, insert do `orders`, insert do `order_items`, update kupónu) do Drizzle transakce (`db.transaction()`).
- Přizpůsobení asynchronní fakturace (funkce pro získání názvů produktů z DB).

#### [MODIFY] app/api/orders/[id]/items/route.js & app/api/orders/[id]/status/route.js
- Přepis updatu statusu a načítání položek existující objednávky do Drizzle.

### 6. Úklid starého kódu

#### [MODIFY] lib/db.js
- Odstranění inicializace `sqlite3` a funkce `getDb()`, tvorby tabulek `CREATE TABLE` a výchozích dat. Ponecháme zde pouze export `UPLOADS_DIR` (případně ho přesuneme), protože už ho nebudeme potřebovat pro přístup k databázi.


## Verification Plan
1. Zavolat Drizzle ORM a zkusit načíst domovskou stránku e-shopu.
2. Vytvořit testovací objednávku přes API nebo v košíku a ověřit, zda se správně uloží do DB, aplikuje kupón a odešle faktura.
3. Vytvořit/upravit produkt přes API nebo admin dashboard.
4. Vytvořit/ověřit kupón přes API.
