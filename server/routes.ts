import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertOrderItemSchema, insertOrderItemToppingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize sample data
  await storage.initializeSampleData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Pizza ingredients routes
  app.get('/api/ingredients/bases', async (req, res) => {
    try {
      const bases = await storage.getPizzaBases();
      res.json(bases);
    } catch (error) {
      console.error("Error fetching pizza bases:", error);
      res.status(500).json({ message: "Failed to fetch pizza bases" });
    }
  });

  app.get('/api/ingredients/sauces', async (req, res) => {
    try {
      const sauces = await storage.getSauces();
      res.json(sauces);
    } catch (error) {
      console.error("Error fetching sauces:", error);
      res.status(500).json({ message: "Failed to fetch sauces" });
    }
  });

  app.get('/api/ingredients/cheeses', async (req, res) => {
    try {
      const cheeses = await storage.getCheeses();
      res.json(cheeses);
    } catch (error) {
      console.error("Error fetching cheeses:", error);
      res.status(500).json({ message: "Failed to fetch cheeses" });
    }
  });

  app.get('/api/ingredients/toppings', async (req, res) => {
    try {
      const toppings = await storage.getToppings();
      res.json(toppings);
    } catch (error) {
      console.error("Error fetching toppings:", error);
      res.status(500).json({ message: "Failed to fetch toppings" });
    }
  });

  app.get('/api/pizza-varieties', async (req, res) => {
    try {
      const varieties = await storage.getPizzaVarieties();
      res.json(varieties);
    } catch (error) {
      console.error("Error fetching pizza varieties:", error);
      res.status(500).json({ message: "Failed to fetch pizza varieties" });
    }
  });

  // Order routes
  const createOrderSchema = z.object({
    deliveryAddress: z.string().min(10, "Delivery address must be at least 10 characters"),
    items: z.array(z.object({
      pizzaVarietyId: z.number().optional(),
      pizzaBaseId: z.number().optional(),
      sauceId: z.number().optional(),
      cheeseId: z.number().optional(),
      toppings: z.array(z.number()).default([]),
      quantity: z.number().min(1).default(1),
      itemPrice: z.string(),
      isCustom: z.boolean().default(false)
    })).min(1, "At least one item is required"),
    totalAmount: z.string()
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = createOrderSchema.parse(req.body);

      // Create order
      const order = await storage.createOrder({
        userId,
        totalAmount: data.totalAmount,
        deliveryAddress: data.deliveryAddress,
        status: 'received',
        paymentStatus: 'pending'
      });

      // Create order items
      for (const item of data.items) {
        const orderItem = await storage.createOrderItem({
          orderId: order.id,
          pizzaVarietyId: item.pizzaVarietyId || null,
          pizzaBaseId: item.pizzaBaseId || null,
          sauceId: item.sauceId || null,
          cheeseId: item.cheeseId || null,
          quantity: item.quantity,
          itemPrice: item.itemPrice,
          isCustom: item.isCustom
        });

        // Add toppings for custom pizzas
        if (item.isCustom && item.toppings.length > 0) {
          for (const toppingId of item.toppings) {
            await storage.createOrderItemTopping({
              orderItemId: orderItem.id,
              toppingId
            });
          }
        }

        // Update inventory (reduce stock)
        if (item.pizzaBaseId) {
          await storage.updateIngredientStock('base', item.pizzaBaseId, -item.quantity);
        }
        if (item.sauceId) {
          await storage.updateIngredientStock('sauce', item.sauceId, -item.quantity);
        }
        if (item.cheeseId) {
          await storage.updateIngredientStock('cheese', item.cheeseId, -item.quantity);
        }
        for (const toppingId of item.toppings) {
          await storage.updateIngredientStock('topping', toppingId, -item.quantity);
        }
      }

      res.json({ orderId: order.id, message: "Order placed successfully" });
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.post('/api/orders/:orderId/payment', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { paymentId } = req.body;

      // In a real app, you would verify the payment with Razorpay
      // For this demo, we'll just mark it as completed
      await storage.updateOrderStatus(orderId, 'received');
      
      // Update payment status
      const order = await storage.getOrderById(orderId);
      if (order) {
        // You would update payment fields here
        res.json({ message: "Payment confirmed successfully" });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.get('/api/orders/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin routes
  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/admin/orders/:orderId/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { orderId } = req.params;
      const { status } = req.body;

      if (!['received', 'kitchen', 'delivery', 'delivered'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateOrderStatus(orderId, status);
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/inventory/low-stock', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post('/api/admin/inventory/update-stock', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { type, id, quantity } = req.body;
      
      if (!['base', 'sauce', 'cheese', 'topping'].includes(type)) {
        return res.status(400).json({ message: "Invalid inventory type" });
      }

      await storage.updateIngredientStock(type, parseInt(id), parseInt(quantity));
      res.json({ message: "Stock updated successfully" });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  app.get('/api/admin/analytics/popular', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const popularItems = await storage.getPopularItems();
      res.json(popularItems);
    } catch (error) {
      console.error("Error fetching popular items:", error);
      res.status(500).json({ message: "Failed to fetch popular items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
