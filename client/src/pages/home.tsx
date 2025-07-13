import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  const { data: pizzaVarieties, isLoading, error } = useQuery({
    queryKey: ["/api/pizza-varieties"],
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
            <p className="mt-4 text-gray-600">Loading delicious pizzas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pizza-orange to-pizza-red text-white py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="absolute inset-0"
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Craft Your Perfect Pizza</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Choose from our premium ingredients and create a pizza that's uniquely yours. 
            Fresh, fast, and delivered hot to your door.
          </p>
          <Link href="/build">
            <Button className="bg-white text-pizza-orange px-8 py-4 text-lg font-semibold hover:bg-gray-100" size="lg">
              Start Your Order
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Pizzas Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Popular Pizza Varieties</h2>
            <p className="text-xl text-gray-600">Handcrafted with love, delivered with care</p>
          </div>
          
          {pizzaVarieties && pizzaVarieties.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {pizzaVarieties.map((pizza: any) => (
                <Card key={pizza.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video relative">
                    <img 
                      src={pizza.imageUrl || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'} 
                      alt={pizza.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">{pizza.name}</h3>
                    <p className="text-gray-600 mb-4">{pizza.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-pizza-orange">${pizza.basePrice}</span>
                      <Link href="/build">
                        <Button className="bg-pizza-red hover:bg-red-600 text-white">
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No pizza varieties available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Custom Pizza CTA */}
      <section className="py-16 bg-pizza-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Create Your Own Masterpiece</h2>
          <p className="text-xl text-gray-600 mb-8">Start with a base and build your perfect pizza with unlimited combinations</p>
          <Link href="/build">
            <Button className="bg-pizza-orange hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold" size="lg">
              Build Custom Pizza
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
