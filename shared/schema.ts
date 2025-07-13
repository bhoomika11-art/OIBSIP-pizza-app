import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pizza ingredients tables
export const pizzaBases = pgTable("pizza_bases", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  threshold: integer("threshold").default(20),
  isActive: boolean("is_active").default(true),
});

export const sauces = pgTable("sauces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  threshold: integer("threshold").default(20),
  isActive: boolean("is_active").default(true),
});

export const cheeses = pgTable("cheeses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0),
  threshold: integer("threshold").default(20),
  isActive: boolean("is_active").default(true),
});

export const toppings = pgTable("toppings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // vegetables, meats, premium, herbs
  stock: integer("stock").default(0),
  threshold: integer("threshold").default(20),
  isActive: boolean("is_active").default(true),
});

// Pizza varieties (preset pizzas)
export const pizzaVarieties = pgTable("pizza_varieties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("received"), // received, kitchen, delivery, delivered
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentId: varchar("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  pizzaVarietyId: integer("pizza_variety_id").references(() => pizzaVarieties.id),
  pizzaBaseId: integer("pizza_base_id").references(() => pizzaBases.id),
  sauceId: integer("sauce_id").references(() => sauces.id),
  cheeseId: integer("cheese_id").references(() => cheeses.id),
  quantity: integer("quantity").default(1),
  itemPrice: decimal("item_price", { precision: 10, scale: 2 }).notNull(),
  isCustom: boolean("is_custom").default(false),
});

// Order item toppings (for custom pizzas)
export const orderItemToppings = pgTable("order_item_toppings", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull().references(() => orderItems.id),
  toppingId: integer("topping_id").notNull().references(() => toppings.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  pizzaVariety: one(pizzaVarieties, {
    fields: [orderItems.pizzaVarietyId],
    references: [pizzaVarieties.id],
  }),
  pizzaBase: one(pizzaBases, {
    fields: [orderItems.pizzaBaseId],
    references: [pizzaBases.id],
  }),
  sauce: one(sauces, {
    fields: [orderItems.sauceId],
    references: [sauces.id],
  }),
  cheese: one(cheeses, {
    fields: [orderItems.cheeseId],
    references: [cheeses.id],
  }),
  toppings: many(orderItemToppings),
}));

export const orderItemToppingsRelations = relations(orderItemToppings, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemToppings.orderItemId],
    references: [orderItems.id],
  }),
  topping: one(toppings, {
    fields: [orderItemToppings.toppingId],
    references: [toppings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPizzaBaseSchema = createInsertSchema(pizzaBases).omit({ id: true });
export const insertSauceSchema = createInsertSchema(sauces).omit({ id: true });
export const insertCheeseSchema = createInsertSchema(cheeses).omit({ id: true });
export const insertToppingSchema = createInsertSchema(toppings).omit({ id: true });
export const insertPizzaVarietySchema = createInsertSchema(pizzaVarieties).omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertOrderItemToppingSchema = createInsertSchema(orderItemToppings).omit({ id: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type PizzaBase = typeof pizzaBases.$inferSelect;
export type InsertPizzaBase = z.infer<typeof insertPizzaBaseSchema>;

export type Sauce = typeof sauces.$inferSelect;
export type InsertSauce = z.infer<typeof insertSauceSchema>;

export type Cheese = typeof cheeses.$inferSelect;
export type InsertCheese = z.infer<typeof insertCheeseSchema>;

export type Topping = typeof toppings.$inferSelect;
export type InsertTopping = z.infer<typeof insertToppingSchema>;

export type PizzaVariety = typeof pizzaVarieties.$inferSelect;
export type InsertPizzaVariety = z.infer<typeof insertPizzaVarietySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type OrderItemTopping = typeof orderItemToppings.$inferSelect;
export type InsertOrderItemTopping = z.infer<typeof insertOrderItemToppingSchema>;
