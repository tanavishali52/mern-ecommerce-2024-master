import ProductImageUpload from "@/components/admin-view/image-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { addFeatureImage, deleteFeatureImage, getFeatureImages } from "@/store/common-slice";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function AdminDashboard() {
  const [imageFiles, setImageFiles] = useState([]); // Changed from imageFile to imageFiles
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFiles([]); // Changed from setImageFile(null) to setImageFiles([])
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteBanner(id) {
    if (!id) return;

    dispatch(deleteFeatureImage(id))
      .unwrap()
      .then(() => {
        toast({
          title: "Banner deleted successfully"
        });
        setBannerToDelete(null);
      })
      .catch((error) => {
        toast({
          title: "Error deleting banner",
          description: error.message,
          variant: "destructive"
        });
      });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        uploadedImageUrls={[uploadedImageUrl]} // Add array wrapper
        setUploadedImageUrls={(urls) => setUploadedImageUrl(urls[0]?.url || "")} // Handle array of URLs
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />
      <Button
        onClick={() => {
          if (!uploadedImageUrl) {
            toast({
              title: "Please upload a banner image first",
              variant: "destructive",
            });
            return;
          }
          handleUploadFeatureImage();
        }}
        className="mt-5 w-full"
        disabled={isLoading}
      >
        Upload
      </Button>
      <div className="grid gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div 
                key={featureImgItem._id || featureImgItem.public_id} 
                className="relative group overflow-hidden rounded-lg"
              >
                <img
                  src={featureImgItem.image}
                  alt={`Feature banner ${featureImgItem._id || featureImgItem.public_id}`}
                  className="w-full h-[300px] object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setBannerToDelete(featureImgItem)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete banner</span>
                </Button>
              </div>
            ))
          : <p className="text-muted-foreground text-center py-8">No banners found. Upload some banners to get started.</p>}
      </div>

      <AlertDialog open={!!bannerToDelete} onOpenChange={(open) => !open && setBannerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <VisuallyHidden>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </VisuallyHidden>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteBanner(bannerToDelete?._id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminDashboard;
