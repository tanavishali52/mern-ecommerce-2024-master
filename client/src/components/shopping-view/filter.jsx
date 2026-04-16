import { filterOptions } from "@/config";
import { Fragment, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

function ProductFilter({ filters, handleFilter }) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-brand-primary/10 overflow-hidden">
      {/* Mobile filter toggle */}
      <div className="lg:hidden bg-brand-light p-4 border-b border-brand-primary/10 flex justify-between items-center cursor-pointer"
           onClick={() => setIsFilterVisible(!isFilterVisible)}>
        <h2 className="text-xl font-bold text-brand-dark">Filters</h2>
        {isFilterVisible ? 
          <ChevronUp className="w-6 h-6 text-brand-dark" /> : 
          <ChevronDown className="w-6 h-6 text-brand-dark" />
        }
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block bg-brand-light p-4 border-b border-brand-primary/10">
        <h2 className="text-xl font-bold text-brand-dark">Filters</h2>
      </div>
      
      {/* Filter content - hidden on mobile unless expanded */}
      <div className={`${!isFilterVisible ? 'hidden lg:block' : ''} p-4 space-y-6`}>
        {Object.keys(filterOptions).map((keyItem, index) => (
          <Fragment key={keyItem}>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-brand-dark">
                {keyItem}
              </h3>
              <div className="grid gap-3">
                {filterOptions[keyItem].map((option) => (
                  <Label 
                    key={option.id}
                    className="flex items-center gap-3 cursor-pointer group hover:text-brand-primary transition-colors"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="border-brand-primary/20 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-brand-primary transition-colors">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </div>
            </div>
            {index < Object.keys(filterOptions).length - 1 && (
              <Separator className="bg-brand-primary/10" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
