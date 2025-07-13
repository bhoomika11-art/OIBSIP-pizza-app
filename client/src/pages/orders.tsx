import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import OrderCard from "@/components/order-card";
import { Card, CardContent } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Package, Clock, CheckCircle } from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/orders/user"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
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
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pizza-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">My Orders</h1>
        
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Yet</h2>
              <p className="text-gray-500 mb-6">
                You haven't placed any orders yet. Start by building your perfect pizza!
              </p>
              <a 
                href="/"
                className="inline-flex items-center px-6 py-3 bg-pizza-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Start Ordering
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
