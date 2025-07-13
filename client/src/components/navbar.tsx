import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pizza, ShoppingCart, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Pizza className="text-pizza-orange text-2xl mr-2" />
            <span className="text-2xl font-bold text-gray-800">PizzaCraft</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-gray-700 hover:text-pizza-orange transition-colors ${
              location === '/' ? 'text-pizza-orange font-medium' : ''
            }`}>
              Home
            </Link>
            <Link href="/build" className={`text-gray-700 hover:text-pizza-orange transition-colors ${
              location === '/build' ? 'text-pizza-orange font-medium' : ''
            }`}>
              Build Pizza
            </Link>
            <Link href="/orders" className={`text-gray-700 hover:text-pizza-orange transition-colors ${
              location === '/orders' ? 'text-pizza-orange font-medium' : ''
            }`}>
              My Orders
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button className="bg-pizza-orange hover:bg-orange-600 text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-gray-700 hover:text-pizza-orange transition-colors">
                <img 
                  src={user?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden md:block">
                  {user?.firstName || 'User'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
