import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, CreditCard } from "lucide-react";

interface CheckoutModalProps {
  pizza: any;
  total: string;
  onClose: () => void;
}

export default function CheckoutModal({ pizza, total, onClose }: CheckoutModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: async (data) => {
      // Simulate payment processing
      setIsProcessing(true);
      
      // Mock payment delay
      setTimeout(async () => {
        try {
          await apiRequest("POST", `/api/orders/${data.orderId}/payment`, {
            paymentId: `pay_${Date.now()}`
          });
          
          setIsProcessing(false);
          onClose();
          toast({
            title: "Order Placed Successfully!",
            description: "Your pizza is being prepared. You'll receive updates on the status.",
          });
          setLocation('/orders');
        } catch (error) {
          setIsProcessing(false);
          toast({
            title: "Payment Failed",
            description: "There was an error processing your payment. Please try again.",
            variant: "destructive",
          });
        }
      }, 2000);
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
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery Address Required",
        description: "Please enter your delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryAddress.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a complete delivery address.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      deliveryAddress,
      totalAmount: (parseFloat(total) + 2.99 + 1.75).toFixed(2), // Add delivery fee and tax
      items: [{
        pizzaBaseId: pizza.base?.id,
        sauceId: pizza.sauce?.id,
        cheeseId: pizza.cheese?.id,
        toppings: pizza.toppings?.map((t: any) => t.id) || [],
        quantity: 1,
        itemPrice: total,
        isCustom: true
      }]
    };

    createOrderMutation.mutate(orderData);
  };

  const finalTotal = (parseFloat(total) + 2.99 + 1.75).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Checkout</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Custom Pizza (Large)</span>
                <span className="font-semibold">${total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Fee</span>
                <span className="font-semibold">$2.99</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax</span>
                <span className="font-semibold">$1.75</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-pizza-orange">${finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <Textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
              placeholder="Enter your complete delivery address..."
              className="w-full"
            />
          </div>

          {/* Mock Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Method</h3>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CreditCard className="text-pizza-orange mr-2 w-5 h-5" />
                <span className="font-medium">Razorpay (Test Mode)</span>
              </div>
              <p className="text-sm text-gray-600">This is a demo payment integration</p>
            </div>
          </div>

          <Button 
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending || isProcessing}
            className="w-full bg-pizza-red hover:bg-red-600 text-white py-3 font-semibold"
          >
            {isProcessing 
              ? 'Processing Payment...' 
              : createOrderMutation.isPending 
                ? 'Placing Order...' 
                : 'Proceed to Payment'
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
