import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function validateForm(formData, uploadedImageUrls) {
  const errors = {};
  
  if (!formData.title?.trim()) errors.title = "Title is required";
  if (!formData.description?.trim()) errors.description = "Description is required";
  if (!formData.category?.trim()) errors.category = "Category is required";
  if (!formData.brand?.trim()) errors.brand = "Brand is required";
  
  const price = Number(formData.price);
  if (!price || isNaN(price) || price <= 0) {
    errors.price = "Price must be a positive number";
  }

  const salePrice = Number(formData.salePrice);
  if (formData.salePrice && (isNaN(salePrice) || salePrice <= 0)) {
    errors.salePrice = "Sale price must be a positive number";
  }
  if (salePrice >= price) {
    errors.salePrice = "Sale price must be less than regular price";
  }

  const stock = Number(formData.totalStock);
  if (!stock || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.totalStock = "Stock must be a positive whole number";
  }

  if (!uploadedImageUrls.length) {
    errors.images = "At least one image is required";
  }

  return errors;
}

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { productList, isLoading } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();

    // Validate form
    const errors = validateForm(formData, uploadedImageUrls);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const errorMessages = Object.values(errors).join(". ");
      toast({
        title: "Validation Error",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }

    if (imageLoadingState) {
      toast({
        title: "Please wait for images to finish uploading",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        ...formData,
        images: JSON.stringify(uploadedImageUrls),
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
        totalStock: Number(formData.totalStock),
      };

      const action = currentEditedId !== null
        ? editProduct({ id: currentEditedId, formData: productData })
        : addNewProduct(productData);

      const result = await dispatch(action).unwrap();
      
      if (result.success) {
        await dispatch(fetchAllProducts());
        setFormData(initialFormData);
        setImageFiles([]);
        setUploadedImageUrls([]);
        setOpenCreateProductsDialog(false);
        setCurrentEditedId(null);
        setFormErrors({});
        toast({
          title: `Product ${currentEditedId !== null ? 'updated' : 'added'} successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${currentEditedId !== null ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    }
  }

  function handleFormChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for the field being changed
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    if (!getCurrentProductId) return;

    dispatch(deleteProduct(getCurrentProductId))
      .unwrap()
      .then(() => {
        dispatch(fetchAllProducts());
        toast({
          title: "Product deleted successfully",
        });
      })
      .catch((error) => {
        toast({
          title: "Error deleting product",
          description: error.message,
          variant: "destructive",
        });
      });
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button 
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setFormErrors({});
          }}
          disabled={isLoading}
        >
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0 ? (
          productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={(data) => {
                setFormData(data);
                setFormErrors({});
              }}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              setImageFiles={setImageFiles}
              setUploadedImageUrls={setUploadedImageUrls}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-4">
            No products found
          </p>
        )}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setImageFiles([]);
            setUploadedImageUrls([]);
            setFormErrors({});
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={false}
          />
          {formErrors.images && (
            <p className="text-sm text-destructive mt-2">{formErrors.images}</p>
          )}
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={handleFormChange}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              errors={formErrors}
              isBtnDisabled={isLoading || imageLoadingState}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
