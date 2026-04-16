import { useState, useEffect } from 'react';
import { Zap, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import filterManager from '@/services/FilterManager';

const HotOffersToggle = ({ 
  variant = 'switch', // 'switch', 'button', 'card'
  showCount = true,
  className = ""
}) => {
  const [filterState, setFilterState] = useState(filterManager.getState());

  // Subscribe to filter manager updates
  useEffect(() => {
    const unsubscribe = filterManager.subscribe((newState) => {
      setFilterState(newState);
    });
    return unsubscribe;
  }, []);

  const handleToggle = async () => {
    await filterManager.updateFilter('hotOffers', !filterState.filters.hotOffers);
  };

  const isActive = filterState.filters.hotOffers;
  const count = filterState.productCounts.hotOffers || 0;

  // Switch variant (default)
  if (variant === 'switch') {
    return (
      <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isActive ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-900 cursor-pointer">
              Hot Offers
            </Label>
            <p className="text-xs text-gray-600">
              Special deals & discounts
              {showCount && count > 0 && (
                <span className="ml-1 font-medium text-orange-600">
                  ({count} available)
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showCount && count > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {count}
            </Badge>
          )}
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-orange-600"
          />
        </div>
      </div>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <Button
        variant={isActive ? "default" : "outline"}
        onClick={handleToggle}
        className={`relative ${
          isActive 
            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0' 
            : 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400'
        } ${className}`}
      >
        <Zap className={`h-4 w-4 mr-2 ${isActive ? 'text-white' : 'text-orange-600'}`} />
        Hot Offers
        {showCount && count > 0 && (
          <Badge className={`ml-2 ${
            isActive 
              ? 'bg-white text-orange-600' 
              : 'bg-red-500 text-white animate-pulse'
          }`}>
            {count}
          </Badge>
        )}
      </Button>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div 
        onClick={handleToggle}
        className={`relative cursor-pointer transition-all duration-300 rounded-xl p-6 ${
          isActive
            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg scale-105'
            : 'bg-gradient-to-br from-orange-50 to-red-50 text-gray-900 hover:shadow-md border border-orange-200'
        } ${className}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2">
            <Flame className="h-8 w-8" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-3 rounded-full ${
              isActive ? 'bg-white bg-opacity-20' : 'bg-orange-100'
            }`}>
              <Zap className={`h-6 w-6 ${
                isActive ? 'text-white' : 'text-orange-600'
              }`} />
            </div>
            
            {showCount && count > 0 && (
              <Badge className={`${
                isActive 
                  ? 'bg-white text-orange-600 font-bold' 
                  : 'bg-red-500 text-white animate-pulse'
              }`}>
                {count} deals
              </Badge>
            )}
          </div>

          <h3 className={`text-lg font-bold mb-1 ${
            isActive ? 'text-white' : 'text-gray-900'
          }`}>
            Hot Offers
          </h3>
          
          <p className={`text-sm ${
            isActive ? 'text-white text-opacity-90' : 'text-gray-600'
          }`}>
            {isActive 
              ? 'Showing special deals & discounts' 
              : 'Click to see special deals & discounts'
            }
          </p>

          {/* Active indicator */}
          {isActive && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Shine effect when active */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-pulse"></div>
        )}
      </div>
    );
  }

  return null;
};

export default HotOffersToggle;