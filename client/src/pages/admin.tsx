import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ShoppingCart, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  ArrowLeft,
  TrendingUp
} from "lucide-react";

type AdminTab = 'orders' | 'inventory' | 'analytics';

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  kitchen: 'bg-yellow-100 text-yellow-800',
  delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800'
};

const statusLabels = {
  received: 'Order Received',
  kitchen: 'In Kitchen',
  delivery: 'Out for Delivery',
  delivered: 'Delivered'
};

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [stockUpdateType, setStockUpdateType] = useState('');
  const [stockUpdateId, setStockUpdateId] = useState('');
  const [stockUpdateQuantity, setStockUpdateQuantity] = useState('');

  const { data: stats, error: statsError } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: orders, error: ordersError } = useQuery({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  const { data: lowStockItems, error: lowStockError } = useQuery({
    queryKey: ["/api/admin/inventory/low-stock"],
    retry: false,
  });

  const { data: popularItems, error: popularError } = useQuery({
    queryKey: ["/api/admin/analytics/popular"],
    retry: false,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ type, id, quantity }: { type: string; id: string; quantity: string }) => {
      await apiRequest("POST", "/api/admin/inventory/update-stock", { type, id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory/low-stock"] });
      setStockUpdateType('');
      setStockUpdateId('');
      setStockUpdateQuantity('');
      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const errors = [statsError, ordersError, lowStockError, popularError].filter(Boolean);
    const unauthorizedError = errors.find(error => isUnauthorizedError(error));
    
    if (unauthorizedError) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [statsError, ordersError, lowStockError, popularError, toast]);

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleStockUpdate = () => {
    if (!stockUpdateType || !stockUpdateId || !stockUpdateQuantity) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    updateStockMutation.mutate({ 
      type: stockUpdateType, 
      id: stockUpdateId, 
      quantity: stockUpdateQuantity 
    });
  };

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats?.todayRevenue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Active Orders</h2>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${order.totalAmount}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Order Received</SelectItem>
                            <SelectItem value="kitchen">In Kitchen</SelectItem>
                            <SelectItem value="delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Low Stock Alerts */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Low Stock Alerts</h2>
          {lowStockItems && lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((stockItem: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="text-red-500 mr-3 w-5 h-5" />
                    <span className="font-medium">{stockItem.item.name} ({stockItem.type})</span>
                  </div>
                  <Badge variant="destructive">
                    {stockItem.item.stock} remaining
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All items are well stocked</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stock Update */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Stock Update</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
              <Select value={stockUpdateType} onValueChange={setStockUpdateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Pizza Base</SelectItem>
                  <SelectItem value="sauce">Sauce</SelectItem>
                  <SelectItem value="cheese">Cheese</SelectItem>
                  <SelectItem value="topping">Topping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
              <Input
                type="number"
                value={stockUpdateId}
                onChange={(e) => setStockUpdateId(e.target.value)}
                placeholder="Enter item ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Quantity</label>
              <Input
                type="number"
                value={stockUpdateQuantity}
                onChange={(e) => setStockUpdateQuantity(e.target.value)}
                placeholder="Enter quantity to add"
              />
            </div>
            <Button 
              onClick={handleStockUpdate}
              disabled={updateStockMutation.isPending}
              className="w-full bg-pizza-orange hover:bg-orange-600 text-white"
            >
              {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Sales Chart Placeholder */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Daily Sales</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Sales chart visualization would go here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Items */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Most Popular Toppings</h2>
          {popularItems && popularItems.length > 0 ? (
            <div className="space-y-4">
              {popularItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <Badge variant="outline">
                    {item.orderCount} orders
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No analytics data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-800">PizzaCraft Admin</div>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to User View
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-pizza-orange text-pizza-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders Management
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-pizza-orange text-pizza-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inventory Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-pizza-orange text-pizza-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
}
