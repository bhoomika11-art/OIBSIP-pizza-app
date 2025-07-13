import { Link } from "wouter";
import { Pizza, Clock, Award, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Pizza className="text-pizza-orange text-2xl mr-2" />
              <span className="text-2xl font-bold text-gray-800">PizzaCraft</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-pizza-orange hover:bg-orange-600 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

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
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-pizza-orange px-8 py-4 text-lg font-semibold hover:bg-gray-100"
            size="lg"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose PizzaCraft?</h2>
            <p className="text-xl text-gray-600">Experience the best pizza delivery service</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pizza-orange rounded-full flex items-center justify-center">
                <Pizza className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Custom Pizza Builder</h3>
              <p className="text-gray-600">Create your perfect pizza with unlimited combinations of fresh ingredients</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pizza-red rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Hot and fresh pizzas delivered to your door in 30 minutes or less</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only the finest ingredients and freshest toppings for the best taste</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pizza-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of satisfied customers and craft your perfect pizza today</p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-pizza-red hover:bg-red-600 text-white px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Pizza className="text-pizza-orange text-2xl mr-2" />
            <span className="text-2xl font-bold">PizzaCraft</span>
          </div>
          <p className="text-gray-400">© 2024 PizzaCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
