import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import PizzaPreview from "@/components/pizza-preview";
import CheckoutModal from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PizzaBuilder {
  base: any;
  sauce: any;
  cheese: any;
  toppings: any[];
}

const steps = [
  { id: 1, name: "Base", description: "Choose your pizza base" },
  { id: 2, name: "Sauce", description: "Select your sauce" },
  { id: 3, name: "Cheese", description: "Pick your cheese" },
  { id: 4, name: "Toppings", description: "Add your toppings" },
  { id: 5, name: "Review", description: "Review your pizza" },
];

export default function PizzaBuilder() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pizzaBuilder, setPizzaBuilder] = useState<PizzaBuilder>({
    base: null,
    sauce: null,
    cheese: null,
    toppings: []
  });

  const { data: bases } = useQuery({
    queryKey: ["/api/ingredients/bases"],
    retry: false,
  });

  const { data: sauces } = useQuery({
    queryKey: ["/api/ingredients/sauces"],
    retry: false,
  });

  const { data: cheeses } = useQuery({
    queryKey: ["/api/ingredients/cheeses"],
    retry: false,
  });

  const { data: toppings } = useQuery({
    queryKey: ["/api/ingredients/toppings"],
    retry: false,
  });

  const handleSelection = (type: string, item: any) => {
    setPizzaBuilder(prev => ({
      ...prev,
      [type]: item
    }));
  };

  const handleToppingToggle = (topping: any, checked: boolean) => {
    setPizzaBuilder(prev => ({
      ...prev,
      toppings: checked 
        ? [...prev.toppings, topping]
        : prev.toppings.filter(t => t.id !== topping.id)
    }));
  };

  const calculateTotal = () => {
    let total = 12.00; // Base pizza price
    
    if (pizzaBuilder.base) total += parseFloat(pizzaBuilder.base.price);
    if (pizzaBuilder.sauce) total += parseFloat(pizzaBuilder.sauce.price);
    if (pizzaBuilder.cheese) total += parseFloat(pizzaBuilder.cheese.price);
    
    pizzaBuilder.toppings.forEach(topping => {
      total += parseFloat(topping.price);
    });
    
    return total.toFixed(2);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return pizzaBuilder.base !== null;
      case 2: return pizzaBuilder.sauce !== null;
      case 3: return pizzaBuilder.cheese !== null;
      case 4: return true; // Toppings are optional
      case 5: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddToCart = () => {
    if (pizzaBuilder.base && pizzaBuilder.sauce && pizzaBuilder.cheese) {
      setShowCheckout(true);
    } else {
      toast({
        title: "Incomplete Pizza",
        description: "Please select base, sauce, and cheese before adding to cart.",
        variant: "destructive",
      });
    }
  };

  const groupedToppings = toppings ? toppings.reduce((groups: any, topping: any) => {
    const category = topping.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(topping);
    return groups;
  }, {}) : {};

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Choose Your Pizza Base</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {bases?.map((base: any) => (
                <Card 
                  key={base.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    pizzaBuilder.base?.id === base.id ? 'ring-2 ring-pizza-orange bg-orange-50' : ''
                  }`}
                  onClick={() => handleSelection('base', base)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🍕</div>
                    <h3 className="font-semibold">{base.name}</h3>
                    <p className="text-sm text-gray-600">{base.description}</p>
                    <p className="text-pizza-orange font-bold">
                      {parseFloat(base.price) === 0 ? 'Free' : `+$${base.price}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Select Your Sauce</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {sauces?.map((sauce: any) => (
                <Card 
                  key={sauce.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    pizzaBuilder.sauce?.id === sauce.id ? 'ring-2 ring-pizza-orange bg-orange-50' : ''
                  }`}
                  onClick={() => handleSelection('sauce', sauce)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🍅</div>
                    <h3 className="font-semibold">{sauce.name}</h3>
                    <p className="text-sm text-gray-600">{sauce.description}</p>
                    <p className="text-pizza-orange font-bold">
                      {parseFloat(sauce.price) === 0 ? 'Free' : `+$${sauce.price}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Choose Your Cheese</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {cheeses?.map((cheese: any) => (
                <Card 
                  key={cheese.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    pizzaBuilder.cheese?.id === cheese.id ? 'ring-2 ring-pizza-orange bg-orange-50' : ''
                  }`}
                  onClick={() => handleSelection('cheese', cheese)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">🧀</div>
                    <h3 className="font-semibold">{cheese.name}</h3>
                    <p className="text-sm text-gray-600">{cheese.description}</p>
                    <p className="text-pizza-orange font-bold">
                      {parseFloat(cheese.price) === 0 ? 'Free' : `+$${cheese.price}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add Your Toppings</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {Object.entries(groupedToppings).map(([category, categoryToppings]: [string, any]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700 capitalize border-b pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryToppings.map((topping: any) => (
                      <div key={topping.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topping-${topping.id}`}
                          checked={pizzaBuilder.toppings.some(t => t.id === topping.id)}
                          onCheckedChange={(checked) => handleToppingToggle(topping, checked as boolean)}
                        />
                        <label 
                          htmlFor={`topping-${topping.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {topping.name} {parseFloat(topping.price) === 0 ? '(Free)' : `(+$${topping.price})`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Review Your Pizza</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <PizzaPreview pizza={pizzaBuilder} />
                <h3 className="text-2xl font-semibold text-gray-800 mt-4">Your Custom Pizza</h3>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Pizza</span>
                      <span>$12.00</span>
                    </div>
                    
                    {pizzaBuilder.base && parseFloat(pizzaBuilder.base.price) > 0 && (
                      <div className="flex justify-between">
                        <span>{pizzaBuilder.base.name} Base</span>
                        <span>+${pizzaBuilder.base.price}</span>
                      </div>
                    )}
                    
                    {pizzaBuilder.sauce && parseFloat(pizzaBuilder.sauce.price) > 0 && (
                      <div className="flex justify-between">
                        <span>{pizzaBuilder.sauce.name} Sauce</span>
                        <span>+${pizzaBuilder.sauce.price}</span>
                      </div>
                    )}
                    
                    {pizzaBuilder.cheese && parseFloat(pizzaBuilder.cheese.price) > 0 && (
                      <div className="flex justify-between">
                        <span>{pizzaBuilder.cheese.name} Cheese</span>
                        <span>+${pizzaBuilder.cheese.price}</span>
                      </div>
                    )}
                    
                    {pizzaBuilder.toppings.map((topping: any) => (
                      parseFloat(topping.price) > 0 && (
                        <div key={topping.id} className="flex justify-between">
                          <span>{topping.name}</span>
                          <span>+${topping.price}</span>
                        </div>
                      )
                    ))}
                  </div>
                  
                  <hr className="my-4" />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-pizza-orange">${calculateTotal()}</span>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-pizza-red hover:bg-red-600 text-white font-semibold mt-4"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
            {steps.map((step) => (
              <span 
                key={step.id}
                className={`${currentStep >= step.id ? 'text-pizza-orange' : 'text-gray-400'}`}
              >
                {step.id}. {step.name}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-pizza-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className={currentStep === 1 ? 'invisible' : ''}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={currentStep === 5 || !canProceed()}
                className={`bg-pizza-orange hover:bg-orange-600 text-white ${currentStep === 5 ? 'invisible' : ''}`}
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCheckout && (
        <CheckoutModal
          pizza={pizzaBuilder}
          total={calculateTotal()}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
