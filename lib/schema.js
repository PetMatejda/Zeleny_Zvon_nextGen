import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const reservation_slots = sqliteTable('reservation_slots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('timeSlot').notNull(), // HH:MM
  capacity: integer('capacity').notNull().default(1),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});

export const reservations = sqliteTable('reservations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD (legacy, kept for fallback)
  timeSlot: text('timeSlot').notNull(), // HH:MM (legacy, kept for fallback)
  slotId: integer('slotId').references(() => reservation_slots.id),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).default('pending'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updatedAt').default(sql`(CURRENT_TIMESTAMP)`),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  category: text('category'),
  description: text('description'),
  image: text('image'),
  stock: integer('stock').default(10),
  is_hero: integer('is_hero', { mode: 'boolean' }).default(false),
  slug: text('slug'),
});

export const coupons = sqliteTable('coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  discount_type: text('discount_type').notNull(),
  discount_value: integer('discount_value').notNull(),
  valid_from: text('valid_from'), // stored as DATETIME (text)
  valid_until: text('valid_until'), // stored as DATETIME (text)
  usage_limit: integer('usage_limit'),
  times_used: integer('times_used').default(0),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerName: text('customerName').notNull(),
  email: text('email').notNull(),
  address: text('address'),
  totalAmount: integer('totalAmount').notNull(),
  status: text('status').default('Nová'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
  coupon_id: integer('coupon_id').references(() => coupons.id),
  // Shipping fields
  shippingMethod: text('shippingMethod').default('pickup'), // 'pickup' | 'home_delivery' | 'packeta_zbox'
  packetaPointId: text('packetaPointId'),      // ID výdejního místa Zásilkovny
  packetaPointName: text('packetaPointName'),  // Název výdejního místa
  deliveryAddress: text('deliveryAddress'),    // Doručovací adresa pro home delivery
  packetaBarcode: text('packetaBarcode'),      // Barcode zásilky (přiřazen Zásilkovnou)
  packetaPacketId: text('packetaPacketId'),    // ID zásilky v systému Zásilkovny
});

export const order_items = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('orderId').references(() => orders.id),
  productId: integer('productId').references(() => products.id),
  quantity: integer('quantity'),
});
