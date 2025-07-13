import {
  users,
  pizzaBases,
  sauces,
  cheeses,
  toppings,
  pizzaVarieties,
  orders,
  orderItems,
  orderItemToppings,
  type User,
  type UpsertUser,
  type PizzaBase,
  type InsertPizzaBase,
  type Sauce,
  type InsertSauce,
  type Cheese,
  type InsertCheese,
  type Topping,
  type InsertTopping,
  type PizzaVariety,
  type InsertPizzaVariety,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderItemTopping,
  type InsertOrderItemTopping,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Ingredient operations
  getPizzaBases(): Promise<PizzaBase[]>;
  getSauces(): Promise<Sauce[]>;
  getCheeses(): Promise<Cheese[]>;
  getToppings(): Promise<Topping[]>;
  getPizzaVarieties(): Promise<PizzaVariety[]>;

  // Inventory operations
  updateIngredientStock(type: 'base' | 'sauce' | 'cheese' | 'topping', id: number, quantity: number): Promise<void>;
  getLowStockItems(): Promise<Array<{type: string, item: any}>>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  createOrderItemTopping(orderItemTopping: InsertOrderItemTopping): Promise<OrderItemTopping>;
  getUserOrders(userId: string): Promise<Array<Order & { items: Array<OrderItem & { toppings: Array<{ topping: Topping }> }> }>>;
  getAllOrders(): Promise<Array<Order & { user: User, items: Array<OrderItem & { toppings: Array<{ topping: Topping }> }> }>>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  getOrderById(orderId: string): Promise<Order | undefined>;

  // Admin operations
  getOrderStats(): Promise<{ totalOrders: number; pendingOrders: number; todayRevenue: number }>;
  getPopularItems(): Promise<Array<{ name: string; orderCount: number }>>;

  // Initialize sample data
  initializeSampleData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ingredient operations
  async getPizzaBases(): Promise<PizzaBase[]> {
    return await db.select().from(pizzaBases).where(eq(pizzaBases.isActive, true)).orderBy(asc(pizzaBases.name));
  }

  async getSauces(): Promise<Sauce[]> {
    return await db.select().from(sauces).where(eq(sauces.isActive, true)).orderBy(asc(sauces.name));
  }

  async getCheeses(): Promise<Cheese[]> {
    return await db.select().from(cheeses).where(eq(cheeses.isActive, true)).orderBy(asc(cheeses.name));
  }

  async getToppings(): Promise<Topping[]> {
    return await db.select().from(toppings).where(eq(toppings.isActive, true)).orderBy(asc(toppings.category), asc(toppings.name));
  }

  async getPizzaVarieties(): Promise<PizzaVariety[]> {
    return await db.select().from(pizzaVarieties).where(eq(pizzaVarieties.isActive, true)).orderBy(asc(pizzaVarieties.name));
  }

  // Inventory operations
  async updateIngredientStock(type: 'base' | 'sauce' | 'cheese' | 'topping', id: number, quantity: number): Promise<void> {
    const table = type === 'base' ? pizzaBases : 
                  type === 'sauce' ? sauces :
                  type === 'cheese' ? cheeses : toppings;
    
    await db.update(table).set({
      stock: sql`${table.stock} + ${quantity}`
    }).where(eq(table.id, id));
  }

  async getLowStockItems(): Promise<Array<{type: string, item: any}>> {
    const lowStockItems = [];

    const lowBases = await db.select().from(pizzaBases)
      .where(and(eq(pizzaBases.isActive, true), sql`${pizzaBases.stock} <= ${pizzaBases.threshold}`));
    lowStockItems.push(...lowBases.map(item => ({ type: 'Pizza Base', item })));

    const lowSauces = await db.select().from(sauces)
      .where(and(eq(sauces.isActive, true), sql`${sauces.stock} <= ${sauces.threshold}`));
    lowStockItems.push(...lowSauces.map(item => ({ type: 'Sauce', item })));

    const lowCheeses = await db.select().from(cheeses)
      .where(and(eq(cheeses.isActive, true), sql`${cheeses.stock} <= ${cheeses.threshold}`));
    lowStockItems.push(...lowCheeses.map(item => ({ type: 'Cheese', item })));

    const lowToppings = await db.select().from(toppings)
      .where(and(eq(toppings.isActive, true), sql`${toppings.stock} <= ${toppings.threshold}`));
    lowStockItems.push(...lowToppings.map(item => ({ type: 'Topping', item })));

    return lowStockItems;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async createOrderItemTopping(orderItemTopping: InsertOrderItemTopping): Promise<OrderItemTopping> {
    const [newOrderItemTopping] = await db.insert(orderItemToppings).values(orderItemTopping).returning();
    return newOrderItemTopping;
  }

  async getUserOrders(userId: string): Promise<Array<Order & { items: Array<OrderItem & { toppings: Array<{ topping: Topping }> }> }>> {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            toppings: {
              with: {
                topping: true
              }
            },
            pizzaBase: true,
            sauce: true,
            cheese: true,
            pizzaVariety: true
          }
        }
      }
    });
    return userOrders as any;
  }

  async getAllOrders(): Promise<Array<Order & { user: User, items: Array<OrderItem & { toppings: Array<{ topping: Topping }> }> }>> {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        user: true,
        items: {
          with: {
            toppings: {
              with: {
                topping: true
              }
            },
            pizzaBase: true,
            sauce: true,
            cheese: true,
            pizzaVariety: true
          }
        }
      }
    });
    return allOrders as any;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db.update(orders).set({
      status,
      updatedAt: new Date()
    }).where(eq(orders.id, orderId));
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    return order;
  }

  // Admin operations
  async getOrderStats(): Promise<{ totalOrders: number; pendingOrders: number; todayRevenue: number }> {
    const totalOrdersResult = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const totalOrders = totalOrdersResult[0]?.count || 0;

    const pendingOrdersResult = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`${orders.status} IN ('received', 'kitchen', 'delivery')`);
    const pendingOrders = pendingOrdersResult[0]?.count || 0;

    const todayRevenueResult = await db.select({ sum: sql<number>`COALESCE(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(sql`DATE(${orders.createdAt}) = CURRENT_DATE AND ${orders.paymentStatus} = 'completed'`);
    const todayRevenue = Number(todayRevenueResult[0]?.sum) || 0;

    return { totalOrders, pendingOrders, todayRevenue };
  }

  async getPopularItems(): Promise<Array<{ name: string; orderCount: number }>> {
    // This is a simplified version - in reality you'd want more complex analytics
    const popularToppings = await db
      .select({
        name: toppings.name,
        orderCount: sql<number>`count(*)`
      })
      .from(orderItemToppings)
      .innerJoin(toppings, eq(orderItemToppings.toppingId, toppings.id))
      .groupBy(toppings.name)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return popularToppings;
  }

  async initializeSampleData(): Promise<void> {
    // Check if data already exists
    const existingBases = await db.select().from(pizzaBases).limit(1);
    if (existingBases.length > 0) return;

    // Insert pizza bases
    await db.insert(pizzaBases).values([
      { name: 'Thin Crust', description: 'Crispy & Light', price: '0.00', stock: 50, threshold: 20 },
      { name: 'Thick Crust', description: 'Hearty & Filling', price: '2.00', stock: 45, threshold: 20 },
      { name: 'Cheese Stuffed', description: 'Cheese in Crust', price: '4.00', stock: 30, threshold: 15 },
      { name: 'Gluten Free', description: 'Healthy Option', price: '3.00', stock: 25, threshold: 15 },
      { name: 'Whole Wheat', description: 'Fiber Rich', price: '2.00', stock: 35, threshold: 20 },
    ]);

    // Insert sauces
    await db.insert(sauces).values([
      { name: 'Marinara', description: 'Classic Tomato', price: '0.00', stock: 60, threshold: 25 },
      { name: 'White Sauce', description: 'Creamy Garlic', price: '1.00', stock: 40, threshold: 20 },
      { name: 'BBQ Sauce', description: 'Sweet & Tangy', price: '1.00', stock: 35, threshold: 20 },
      { name: 'Pesto', description: 'Basil & Herbs', price: '2.00', stock: 25, threshold: 15 },
      { name: 'Buffalo', description: 'Spicy Kick', price: '1.00', stock: 30, threshold: 15 },
    ]);

    // Insert cheeses
    await db.insert(cheeses).values([
      { name: 'Mozzarella', description: 'Classic Choice', price: '0.00', stock: 80, threshold: 30 },
      { name: 'Cheddar', description: 'Sharp & Bold', price: '1.00', stock: 50, threshold: 25 },
      { name: 'Parmesan', description: 'Rich & Nutty', price: '2.00', stock: 35, threshold: 20 },
      { name: 'Vegan Cheese', description: 'Plant Based', price: '3.00', stock: 25, threshold: 15 },
    ]);

    // Insert toppings
    await db.insert(toppings).values([
      // Vegetables
      { name: 'Mushrooms', description: 'Fresh Button Mushrooms', price: '1.00', category: 'vegetables', stock: 40, threshold: 20 },
      { name: 'Bell Peppers', description: 'Colorful Sweet Peppers', price: '1.00', category: 'vegetables', stock: 45, threshold: 20 },
      { name: 'Red Onions', description: 'Sweet Red Onions', price: '1.00', category: 'vegetables', stock: 50, threshold: 25 },
      { name: 'Black Olives', description: 'Mediterranean Olives', price: '1.00', category: 'vegetables', stock: 35, threshold: 20 },
      { name: 'Fresh Tomatoes', description: 'Vine Ripened Tomatoes', price: '1.00', category: 'vegetables', stock: 30, threshold: 15 },
      
      // Meats
      { name: 'Pepperoni', description: 'Classic Spicy Pepperoni', price: '2.00', category: 'meats', stock: 60, threshold: 25 },
      { name: 'Italian Sausage', description: 'Seasoned Italian Sausage', price: '2.00', category: 'meats', stock: 40, threshold: 20 },
      { name: 'Ham', description: 'Premium Deli Ham', price: '2.00', category: 'meats', stock: 35, threshold: 20 },
      { name: 'Bacon', description: 'Crispy Bacon Bits', price: '2.00', category: 'meats', stock: 30, threshold: 15 },
      { name: 'Grilled Chicken', description: 'Marinated Grilled Chicken', price: '3.00', category: 'meats', stock: 25, threshold: 15 },
      
      // Premium
      { name: 'Pineapple', description: 'Sweet Tropical Pineapple', price: '1.00', category: 'premium', stock: 25, threshold: 15 },
      { name: 'Artichokes', description: 'Marinated Artichoke Hearts', price: '2.00', category: 'premium', stock: 20, threshold: 10 },
      { name: 'Sun-dried Tomatoes', description: 'Intense Flavor Tomatoes', price: '2.00', category: 'premium', stock: 15, threshold: 10 },
      { name: 'Roasted Garlic', description: 'Sweet Roasted Garlic', price: '1.00', category: 'premium', stock: 30, threshold: 15 },
      
      // Herbs & Extras
      { name: 'Fresh Basil', description: 'Aromatic Fresh Basil', price: '0.00', category: 'herbs', stock: 100, threshold: 20 },
      { name: 'Oregano', description: 'Dried Mediterranean Oregano', price: '0.00', category: 'herbs', stock: 100, threshold: 20 },
      { name: 'Extra Cheese', description: 'Double the Cheese', price: '2.00', category: 'herbs', stock: 50, threshold: 25 },
      { name: 'Red Pepper Flakes', description: 'Spicy Red Pepper', price: '0.00', category: 'herbs', stock: 100, threshold: 20 },
    ]);

    // Insert pizza varieties
    await db.insert(pizzaVarieties).values([
      {
        name: 'Classic Margherita',
        description: 'Fresh mozzarella, basil, and tomato sauce on crispy thin crust',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        basePrice: '12.99'
      },
      {
        name: 'Pepperoni Supreme',
        description: 'Premium pepperoni with extra cheese on our signature crust',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        basePrice: '15.99'
      },
      {
        name: 'Veggie Supreme',
        description: 'Fresh vegetables, mushrooms, and peppers with herb seasoning',
        imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        basePrice: '14.99'
      }
    ]);
  }
}

export const storage = new DatabaseStorage();
