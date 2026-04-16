import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Tag,
  Zap,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { categoryHierarchy, categoryUtils } from '@/config/category-hierarchy';
import filterManager from '@/services/FilterManager';

const UnifiedFilterSidebar = ({ 
  className = "",
  isMobile = false,
  onClose 
}) => {
  const [filterState, setFilterState] = useState(filterManager.getState());
  const [expandedSections, setExpandedSections] = useState({
    hotOffers: true,
    departments: true,
    categories: true,
    brands: true,
    price: false,
    attributes: false
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [customPriceRange, setCustomPriceRange] = useState({ min: '', max: '' });

  // Subscribe to filter manager updates
  useEffect(() => {
    const unsubscribe = filterManager.subscribe((newState) => {
      setFilterState(newState);
    });
    return unsubscribe;
  }, []);

  // Update price range when filters change
  useEffect(() => {
    if (filterState.filters.priceRange.min !== null || filterState.filters.priceRange.max !== null) {
      setPriceRange([
        filterState.filters.priceRange.min || 0,
        filterState.filters.priceRange.max || 1000
      ]);
    }
  }, [filterState.filters.priceRange]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = async (filterType, value, isAdd = true) => {
    await filterManager.updateFilter(filterType, value, isAdd);
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
    // Debounce the actual filter update
    clearTimeout(window.priceRangeTimeout);
    window.priceRangeTimeout = setTimeout(() => {
      handleFilterChange('priceRange', { min: values[0], max: values[1] });
    }, 500);
  };

  const handleCustomPriceSubmit = () => {
    const min = parseFloat(customPriceRange.min) || 0;
    const max = parseFloat(customPriceRange.max) || 1000;
    
    if (min >= 0 && max > min) {
      setPriceRange([min, max]);
      handleFilterChange('priceRange', { min, max });
    }
  };

  const clearAllFilters = async () => {
    await filterManager.clearAllFilters();
    setPriceRange([0, 1000]);
    setCustomPriceRange({ min: '', max: '' });
  };

  const getActiveFilterCount = () => {
    const { filters } = filterState;
    let count = 0;
    
    if (filters.department) count++;
    if (filters.primaryCategory) count++;
    if (filters.subCategories.length > 0) count += filters.subCategories.length;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.hotOffers) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.attributes.color.length > 0) count += filters.attributes.color.length;
    if (filters.attributes.size.length > 0) count += filters.attributes.size.length;
    
    return count;
  };

  const FilterSection = ({ title, icon: Icon, isExpanded, onToggle, children, count = 0 }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-4 w-4 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
          {count > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {count}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white ${isMobile ? 'h-full' : 'rounded-lg shadow-sm border'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <Badge className="bg-orange-600">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
          
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Hot Offers */}
        <FilterSection
          title="Hot Offers"
          icon={Zap}
          isExpanded={expandedSections.hotOffers}
          onToggle={() => toggleSection('hotOffers')}
          count={filterState.productCounts.hotOffers || 0}
        >
          <Label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={filterState.filters.hotOffers}
              onCheckedChange={(checked) => handleFilterChange('hotOffers', checked)}
              className="border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
            />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Special Deals & Discounts</span>
              {filterState.productCounts.hotOffers > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filterState.productCounts.hotOffers}
                </Badge>
              )}
            </div>
          </Label>
        </FilterSection>

        {/* Departments */}
        <FilterSection
          title="Departments"
          isExpanded={expandedSections.departments}
          onToggle={() => toggleSection('departments')}
        >
          <div className="space-y-3">
            {categoryUtils.getDepartments().map((dept) => (
              <Label 
                key={dept.id}
                className="flex items-center gap-3 cursor-pointer group hover:text-orange-600 transition-colors"
              >
                <Checkbox
                  checked={filterState.filters.department === dept.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilterChange('department', dept.id);
                    } else {
                      handleFilterChange('department', null);
                    }
                  }}
                  className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                />
                <span className="text-sm font-medium">{dept.label}</span>
                {filterState.productCounts.departments?.[dept.id] > 0 && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {filterState.productCounts.departments[dept.id]}
                  </Badge>
                )}
              </Label>
            ))}
          </div>
        </FilterSection>

        {/* Primary Categories */}
        {filterState.filters.department && (
          <FilterSection
            title="Categories"
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-3">
              {categoryUtils.getPrimaryCategories(filterState.filters.department).map((cat) => (
                <Label 
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer group hover:text-orange-600 transition-colors"
                >
                  <Checkbox
                    checked={filterState.filters.primaryCategory === cat.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange('primaryCategory', cat.id);
                      } else {
                        handleFilterChange('primaryCategory', null);
                      }
                    }}
                    className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <span className="text-sm font-medium">{cat.label}</span>
                </Label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Sub-Categories */}
        {filterState.filters.department && filterState.filters.primaryCategory && (
          <FilterSection
            title="Sub-Categories"
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-3">
              {categoryUtils.getSubCategories(
                filterState.filters.department, 
                filterState.filters.primaryCategory
              ).map((subCat) => (
                <Label 
                  key={subCat.id}
                  className="flex items-center gap-3 cursor-pointer group hover:text-orange-600 transition-colors"
                >
                  <Checkbox
                    checked={filterState.filters.subCategories.includes(subCat.id)}
                    onCheckedChange={(checked) => {
                      handleFilterChange('subCategories', subCat.id, checked);
                    }}
                    className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <span className="text-sm font-medium">{subCat.label}</span>
                  {filterState.productCounts.subCategories?.[subCat.id] > 0 && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {filterState.productCounts.subCategories[subCat.id]}
                    </Badge>
                  )}
                </Label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Brands */}
        {filterState.availableBrands.length > 0 && (
          <FilterSection
            title="Brands"
            icon={Tag}
            isExpanded={expandedSections.brands}
            onToggle={() => toggleSection('brands')}
            count={filterState.filters.brands.length}
          >
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {filterState.availableBrands.map((brand) => (
                <Label 
                  key={brand.id}
                  className="flex items-center gap-3 cursor-pointer group hover:text-orange-600 transition-colors"
                >
                  <Checkbox
                    checked={filterState.filters.brands.includes(brand.id)}
                    onCheckedChange={(checked) => {
                      handleFilterChange('brands', brand.id, checked);
                    }}
                    className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <span className="text-sm font-medium">{brand.label}</span>
                  {brand.count > 0 && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {brand.count}
                    </Badge>
                  )}
                </Label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          icon={DollarSign}
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            {/* Price Slider */}
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Custom Price Inputs */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs text-gray-600">Min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={customPriceRange.min}
                  onChange={(e) => setCustomPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-gray-600">Max</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={customPriceRange.max}
                  onChange={(e) => setCustomPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleCustomPriceSubmit}
                className="mt-4 h-8 bg-orange-600 hover:bg-orange-700"
              >
                Apply
              </Button>
            </div>
          </div>
        </FilterSection>

        {/* Color Attributes */}
        <FilterSection
          title="Colors"
          isExpanded={expandedSections.attributes}
          onToggle={() => toggleSection('attributes')}
          count={filterState.filters.attributes.color.length}
        >
          <div className="grid grid-cols-4 gap-2">
            {['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple'].map((color) => (
              <button
                key={color}
                onClick={() => {
                  const isSelected = filterState.filters.attributes.color.includes(color);
                  handleFilterChange('attributes', { type: 'color', values: [color] }, !isSelected);
                }}
                className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                  filterState.filters.attributes.color.includes(color)
                    ? 'border-orange-500 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color === 'white' ? '#ffffff' : color }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              >
                {filterState.filters.attributes.color.includes(color) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${color === 'white' || color === 'yellow' ? 'bg-gray-800' : 'bg-white'}`} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Size Attributes */}
        <FilterSection
          title="Sizes"
          isExpanded={expandedSections.attributes}
          onToggle={() => toggleSection('attributes')}
          count={filterState.filters.attributes.size.length}
        >
          <div className="grid grid-cols-4 gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <Button
                key={size}
                variant={filterState.filters.attributes.size.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const isSelected = filterState.filters.attributes.size.includes(size);
                  handleFilterChange('attributes', { type: 'size', values: [size] }, !isSelected);
                }}
                className={`h-8 text-xs ${
                  filterState.filters.attributes.size.includes(size)
                    ? 'bg-orange-600 hover:bg-orange-700 border-orange-600'
                    : 'hover:border-orange-300'
                }`}
              >
                {size}
              </Button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Loading State */}
      {filterState.isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}
    </div>
  );
};

export default UnifiedFilterSidebar;