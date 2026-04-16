import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { ChevronLeftIcon, ChevronRightIcon, Star } from "lucide-react";
import ReviewGeneratorModal from "./review-generator-modal";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  setImageFiles,
  setUploadedImageUrls,
  handleDelete,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewGenerator, setShowReviewGenerator] = useState(false);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleReviewGenerated = (data) => {
    // Optionally refresh product data or show success message
    console.log('Reviews generated:', data);
  };

  return (
    <>
      <Card className="w-full max-w-sm mx-auto">
        <div>
          <div className="relative">
            <img
              src={product?.images?.[currentImageIndex]?.url || product?.image}
              alt={product?.title}
              className="w-full h-[300px] object-cover rounded-t-lg"
            />
            {(product?.images?.length > 1 || (product.image && product.images?.length)) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
                  onClick={handlePrevImage}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full"
                  onClick={handleNextImage}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <CardContent>
            <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
            <div className="flex justify-between items-center mb-2">
              <span
                className={`${
                  product?.salePrice > 0 ? "line-through" : ""
                } text-lg font-semibold text-primary`}
              >
                PKR {product?.price}
              </span>
              {product?.salePrice > 0 ? (
                <span className="text-lg font-bold">PKR {product?.salePrice}</span>
              ) : null}
            </div>
            {/* Display average review if available */}
            {product?.averageReview > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{product.averageReview}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <Button
                onClick={() => {
                  setOpenCreateProductsDialog(true);
                  setCurrentEditedId(product?._id);
                  setFormData(product);
                  setImageFiles([]); // Initialize as empty array first
                  setUploadedImageUrls(product?.images || []); // Set existing image URLs
                }}
              >
                Edit
              </Button>
              <Button onClick={() => handleDelete(product?._id)}>Delete</Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReviewGenerator(true)}
            >
              <Star className="h-4 w-4 mr-2" />
              Add Reviews
            </Button>
          </CardFooter>
        </div>
      </Card>

      {/* Review Generator Modal */}
      <ReviewGeneratorModal
        isOpen={showReviewGenerator}
        onClose={() => setShowReviewGenerator(false)}
        productId={product?._id}
        productTitle={product?.title}
        onGenerated={handleReviewGenerated}
      />
    </>
  );
}

export default AdminProductTile;
