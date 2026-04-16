import { Star } from "lucide-react";
import { useCallback } from "react";

function StarRatingComponent({
  value = 0,
  onChange,
  maxStars = 5,
  readOnly = false,
}) {
  const handleStarClick = useCallback(
    (starIndex) => {
      if (!readOnly && onChange) {
        onChange(starIndex + 1);
      }
    },
    [onChange, readOnly]
  );

  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) => (
        <Star
          key={`star-${index}`}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            index < value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
          } ${readOnly ? "cursor-default" : "hover:text-yellow-400"}`}
          onClick={() => handleStarClick(index)}
        />
      ))}
    </div>
  );
}

export default StarRatingComponent;
