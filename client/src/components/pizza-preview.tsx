interface PizzaPreviewProps {
  pizza: {
    base: any;
    sauce: any;
    cheese: any;
    toppings: any[];
  };
}

export default function PizzaPreview({ pizza }: PizzaPreviewProps) {
  return (
    <div className="relative">
      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
        {/* Pizza base */}
        <div className="w-56 h-56 bg-yellow-300 rounded-full flex items-center justify-center relative">
          {/* Sauce layer */}
          {pizza.sauce && (
            <div className="w-48 h-48 bg-red-400 rounded-full flex items-center justify-center opacity-80">
              {/* Cheese layer */}
              {pizza.cheese && (
                <div className="w-40 h-40 bg-yellow-200 rounded-full flex items-center justify-center opacity-90">
                  {/* Toppings */}
                  <div className="relative w-32 h-32">
                    {pizza.toppings.slice(0, 6).map((topping, index) => (
                      <div
                        key={topping.id}
                        className="absolute w-4 h-4 bg-green-600 rounded-full"
                        style={{
                          top: `${20 + index * 15}%`,
                          left: `${15 + (index % 3) * 25}%`,
                          backgroundColor: topping.category === 'meats' ? '#8B4513' :
                                         topping.category === 'vegetables' ? '#228B22' :
                                         '#FFD700'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Pizza info */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 space-y-1">
          {pizza.base && <div>Base: {pizza.base.name}</div>}
          {pizza.sauce && <div>Sauce: {pizza.sauce.name}</div>}
          {pizza.cheese && <div>Cheese: {pizza.cheese.name}</div>}
          {pizza.toppings.length > 0 && (
            <div>Toppings: {pizza.toppings.map(t => t.name).join(', ')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
