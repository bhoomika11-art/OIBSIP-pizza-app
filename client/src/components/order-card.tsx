import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Pizza } from "lucide-react";

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

interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  const getProgressPercentage = () => {
    switch (order.status) {
      case 'received': return 25;
      case 'kitchen': return 50;
      case 'delivery': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Order #{order.id.slice(-8)}
            </h3>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
            {statusLabels[order.status as keyof typeof statusLabels]}
          </Badge>
        </div>
        
        {/* Order Items */}
        <div className="border-t pt-4 mb-4">
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Pizza className="w-4 h-4 text-pizza-orange mr-2" />
                  <span>
                    {item.isCustom ? 'Custom Pizza' : item.pizzaVariety?.name || 'Pizza'}
                    {item.quantity > 1 && ` x${item.quantity}`}
                  </span>
                </div>
                <span className="font-semibold">${item.itemPrice}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No items found</div>
          )}
        </div>
        
        {/* Order Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                order.status === 'received' || order.status === 'kitchen' || 
                order.status === 'delivery' || order.status === 'delivered' 
                  ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`${
                order.status === 'received' || order.status === 'kitchen' || 
                order.status === 'delivery' || order.status === 'delivered'
                  ? 'text-green-600 font-medium' : 'text-gray-400'
              }`}>
                Order Received
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                order.status === 'kitchen' || order.status === 'delivery' || order.status === 'delivered'
                  ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <span className={`${
                order.status === 'kitchen' || order.status === 'delivery' || order.status === 'delivered'
                  ? 'text-yellow-600 font-medium' : 'text-gray-400'
              }`}>
                In Kitchen
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                order.status === 'delivery' || order.status === 'delivered'
                  ? 'bg-purple-500' : 'bg-gray-300'
              }`}></div>
              <span className={`${
                order.status === 'delivery' || order.status === 'delivered'
                  ? 'text-purple-600 font-medium' : 'text-gray-400'
              }`}>
                Out for Delivery
              </span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`${
                order.status === 'delivered' ? 'text-green-600 font-medium' : 'text-gray-400'
              }`}>
                Delivered
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pizza-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Delivery Address */}
        <div className="p-3 bg-blue-50 rounded-lg mb-4">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium text-sm">Delivery Address:</p>
              <p className="text-blue-700 text-sm">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>
        
        {/* Estimated Delivery Time */}
        {order.status !== 'delivered' && (
          <div className="p-3 bg-green-50 rounded-lg mb-4">
            <p className="text-green-800 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Estimated delivery: 25-30 minutes
            </p>
          </div>
        )}
        
        {/* Total and Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-lg font-semibold">Total: </span>
            <span className="text-xl font-bold text-pizza-orange">${order.totalAmount}</span>
          </div>
          
          {order.status === 'delivered' && (
            <Button variant="outline" className="hover:bg-pizza-orange hover:text-white">
              Reorder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
