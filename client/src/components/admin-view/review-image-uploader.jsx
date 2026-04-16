import { useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useToast } from "../ui/use-toast";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileImage,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Trash2
} from "lucide-react";

const ReviewImageUploader = ({ 
  reviewId, 
  existingImages = [], 
  onImagesUpdated,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const remainingSlots = maxImages - existingImages.length;

  const validateFile = (file) => {
    const errors = [];

    if (!supportedFormats.includes(file.type)) {
      errors.push(`${file.name}: Unsupported format. Use JPG, PNG, or WebP.`);
    }

    if (file.size > maxFileSize) {
      errors.push(`${file.name}: File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
    }

    return errors;
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    // Check total count
    if (fileArray.length + existingImages.length > maxImages) {
      errors.push(`Cannot upload ${fileArray.length} files. Maximum ${maxImages} images per review (${remainingSlots} slots remaining).`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(...fileErrors);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Validation Failed",
        description: errors.join(' '),
        variant: "destructive"
      });
      return;
    }

    // Create preview URLs
    const previews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setSelectedFiles(validFiles);
    setPreviewImages(previews);
  }, [existingImages.length, maxImages, remainingSlots, toast, maxFileSize]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removePreviewImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewImages[index].url);
    
    setPreviewImages(newPreviews);
    setSelectedFiles(newFiles);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('review_images', file);
      });

      const response = await fetch(`/api/admin/reviews/${reviewId}/images`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Images Uploaded Successfully",
          description: `Uploaded ${data.data.uploadedImages.length} images to the review.`
        });

        // Clear previews and selected files
        previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
        setPreviewImages([]);
        setSelectedFiles([]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent component
        if (onImagesUpdated) {
          onImagesUpdated(data.data.uploadedImages);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteExistingImage = async (imageId, imageName) => {
    if (!confirm(`Are you sure you want to delete "${imageName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Image Deleted",
          description: `"${imageName}" has been deleted successfully.`
        });

        // Notify parent component
        if (onImagesUpdated) {
          onImagesUpdated([]);
        }
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Existing Images ({existingImages.length}/{maxImages})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image._id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteExistingImage(image._id, image.originalName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Images
              </div>
              <Badge variant="secondary">
                {remainingSlots} slots remaining
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {dragActive ? 'Drop images here' : 'Drag & drop images here'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to select files
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mb-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Images
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: JPG, PNG, WebP</p>
                <p>Maximum file size: {maxFileSize / (1024 * 1024)}MB</p>
                <p>Maximum {maxImages} images per review</p>
              </div>
            </div>

            {/* Preview Selected Images */}
            {previewImages.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Selected Images ({previewImages.length})
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePreviewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {preview.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(preview.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Uploading images...</span>
                      <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={uploadImages}
                    disabled={uploading || selectedFiles.length === 0}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
                      setPreviewImages([]);
                      setSelectedFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={uploading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No More Slots Available */}
      {remainingSlots === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">
                Maximum images reached
              </span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              This review already has the maximum of {maxImages} images. 
              Delete existing images to upload new ones.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewImageUploader;