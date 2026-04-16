import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import { 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const ReviewImageGallery = ({ 
  images = [], 
  reviewId,
  reviewUserName,
  onImageDeleted,
  showControls = true,
  compact = false
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const openImageViewer = (index) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
    setZoom(1);
    setRotation(0);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setSelectedImageIndex(null);
    setZoom(1);
    setRotation(0);
  };

  const navigateImage = (direction) => {
    if (selectedImageIndex === null) return;
    
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % images.length
      : (selectedImageIndex - 1 + images.length) % images.length;
    
    setSelectedImageIndex(newIndex);
    setZoom(1);
    setRotation(0);
  };

  const handleZoom = (zoomIn) => {
    setZoom(prev => {
      const newZoom = zoomIn ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || `review-image-${image._id}`;
      a.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading "${image.originalName}"`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image.",
        variant: "destructive"
      });
    }
  };

  const deleteImage = async (image) => {
    if (!confirm(`Are you sure you want to delete "${image.originalName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/images/${image._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Image Deleted",
          description: `"${image.originalName}" has been deleted successfully.`
        });

        if (onImageDeleted) {
          onImageDeleted(image._id);
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

  if (images.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {images.length} image{images.length > 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openImageViewer(0)}
          className="h-6 px-2 text-xs"
        >
          View
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Review Images
            </div>
            <Badge variant="secondary">
              {images.length} image{images.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image._id} className="relative group">
                <div 
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openImageViewer(index)}
                >
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                
                {showControls && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageViewer(index);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

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

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={closeImageViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span>Image Viewer</span>
                {reviewUserName && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    from {reviewUserName}'s review
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} of {images.length}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedImageIndex !== null && (
            <div className="relative flex-1 overflow-hidden">
              {/* Image Display */}
              <div className="relative h-[60vh] bg-black flex items-center justify-center">
                <img
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].originalName}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`
                  }}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => navigateImage('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                      onClick={() => navigateImage('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoom(false)}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-16 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleZoom(true)}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(images[selectedImageIndex])}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {showControls && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deleteImage(images[selectedImageIndex]);
                          closeImageViewer();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Image Info */}
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-muted-foreground truncate">
                        {images[selectedImageIndex].originalName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-muted-foreground">
                        {formatFileSize(images[selectedImageIndex].size)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="text-muted-foreground">
                        {images[selectedImageIndex].mimeType}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <p className="text-muted-foreground">
                        {new Date(images[selectedImageIndex].uploadedAt || images[selectedImageIndex].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewImageGallery;