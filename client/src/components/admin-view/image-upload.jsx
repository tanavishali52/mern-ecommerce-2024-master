import React, { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { UploadCloudIcon, XIcon, FileIcon } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

function ProductImageUpload({
  imageFiles = [], // Add default empty array
  setImageFiles,
  uploadedImageUrls = [], // Add default empty array
  setUploadedImageUrls,
  setImageLoadingState,
  imageLoadingState,
  isEditMode = false,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  async function uploadImagesToCloudinary() {
    if (!imageFiles?.length) return;
    
    setImageLoadingState(true);
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append("my_files", file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (response?.data?.success) {
        const results = response.data.data?.results || response.data.results || [];
        setUploadedImageUrls(results.map(result => ({
          url: result.url,
          public_id: result.public_id
        })));
        toast({
          title: "Images uploaded successfully",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to upload images";
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive"
      });
      // Clear the failed uploads
      setImageFiles([]);
      setUploadedImageUrls([]);
    } finally {
      setImageLoadingState(false);
    }
  }

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    const totalFiles = selectedFiles.length + (imageFiles?.length || 0);
    
    if (totalFiles > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 images allowed",
        variant: "destructive"
      });
      return;
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Each image must be less than 20MB",
        variant: "destructive"
      });
      return;
    }

    const invalidFiles = selectedFiles.filter(file => 
      !file.type.startsWith('image/')
    );
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive"
      });
      return;
    }

    setImageFiles(prev => [...prev, ...selectedFiles]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    
    const totalFiles = droppedFiles.length + (imageFiles?.length || 0);
    if (totalFiles > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 images allowed",
        variant: "destructive"
      });
      return;
    }

    const oversizedFiles = droppedFiles.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Each image must be less than 20MB",
        variant: "destructive"
      });
      return;
    }

    const invalidFiles = droppedFiles.filter(file => 
      !file.type.startsWith('image/')
    );
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive"
      });
      return;
    }

    setImageFiles(prev => [...prev, ...droppedFiles]);
  }

  function handleRemoveImage(index) {
    // Ensure both arrays are properly synchronized
    setImageFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log(`Removed image at index ${index}. Remaining files:`, newFiles.length);
      return newFiles;
    });
    
    setUploadedImageUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      console.log(`Removed URL at index ${index}. Remaining URLs:`, newUrls.length);
      return newUrls;
    });
    
    // Clear the file input to prevent issues with file selection
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  useEffect(() => {
    if (imageFiles?.length > 0) {
      uploadImagesToCloudinary();
    }
  }, [imageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">Upload Images (Max 10)</Label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${isEditMode ? "opacity-60" : ""} border-2 ${
          dragOver ? "border-primary bg-primary/5" : "border-dashed"
        } rounded-lg p-4 transition-colors`}
      >
        <Input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode || (imageFiles?.length || 0) >= 10}
        />
        
        {(!imageFiles?.length) ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50 transition-colors`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload images (max 10)</span>
            <span className="text-sm text-muted-foreground mt-1">
              All image types supported (max 20MB each)
            </span>
          </Label>
        ) : (
          <div className="space-y-2">
            {imageFiles.map((file, index) => (
              imageLoadingState ? (
                <Skeleton key={index} className="h-10 bg-gray-100" />
              ) : (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileIcon className="w-6 h-6 text-primary mr-2" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isEditMode || imageLoadingState}
                  >
                    <XIcon className="w-4 h-4" />
                    <span className="sr-only">Remove File</span>
                  </Button>
                </div>
              )
            ))}
            {imageFiles.length < 10 && !isEditMode && (
              <Label
                htmlFor="image-upload"
                className="flex items-center justify-center p-2 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <UploadCloudIcon className="w-6 h-6 text-muted-foreground mr-2" />
                <span>Add more images</span>
              </Label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductImageUpload;
