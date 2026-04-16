import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/use-toast";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Star, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RotateCcw,
  Image as ImageIcon,
  List,
  Shuffle
} from "lucide-react";

const ReviewGeneratorModal = ({ 
  isOpen, 
  onClose, 
  productId, 
  productTitle,
  onGenerated 
}) => {
  const [selectedCount, setSelectedCount] = useState(null);
  const [includeImages, setIncludeImages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState(null);
  const [existingReviews, setExistingReviews] = useState(null);
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [selectionMode, setSelectionMode] = useState('auto'); // 'auto' or 'manual'
  const { toast } = useToast();

  const reviewCountOptions = [
    { 
      count: 5, 
      blocks: 1, 
      description: "Quick start with 1 block",
      estimatedTime: "< 1 second"
    },
    { 
      count: 20, 
      blocks: 4, 
      description: "Good coverage with 4 blocks",
      estimatedTime: "< 2 seconds"
    },
    { 
      count: 50, 
      blocks: 10, 
      description: "Strong presence with 10 blocks",
      estimatedTime: "< 3 seconds"
    },
    { 
      count: 100, 
      blocks: 20, 
      description: "Maximum coverage with all 20 blocks",
      estimatedTime: "< 5 seconds"
    }
  ];

  // Fetch generation options and existing reviews when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchGenerationOptions();
      checkExistingReviews();
      fetchAvailableBlocks();
    }
  }, [isOpen, productId]);

  const fetchGenerationOptions = async () => {
    try {
      const response = await fetch('/api/admin/reviews/generation-options');
      const data = await response.json();
      
      if (data.success) {
        setGenerationOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching generation options:', error);
    }
  };

  const fetchAvailableBlocks = async () => {
    try {
      const response = await fetch('/api/admin/reviews/blocks');
      const data = await response.json();
      
      if (data.success) {
        setAvailableBlocks(data.data);
      }
    } catch (error) {
      console.error('Error fetching available blocks:', error);
    }
  };

  const checkExistingReviews = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/reviews?type=generated&limit=1`);
      const data = await response.json();
      
      if (data.success) {
        setExistingReviews(data.data.statistics);
        setShowRegenerateOption(data.data.statistics.generated > 0);
      }
    } catch (error) {
      console.error('Error checking existing reviews:', error);
    }
  };

  const handleBlockSelection = (blockId, checked) => {
    if (checked) {
      setSelectedBlocks(prev => [...prev, blockId]);
    } else {
      setSelectedBlocks(prev => prev.filter(id => id !== blockId));
    }
  };

  const handleGenerate = async (regenerate = false) => {
    if (!selectedCount) {
      toast({
        title: "Selection Required",
        description: "Please select the number of reviews to generate.",
        variant: "destructive"
      });
      return;
    }

    // Validate block selection in manual mode
    if (selectionMode === 'manual' && selectedBlocks.length === 0) {
      toast({
        title: "Block Selection Required",
        description: "Please select at least one review block.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const requestBody = {
        totalReviews: selectedCount,
        includeImages,
        regenerate
      };

      // Add block selection if in manual mode
      if (selectionMode === 'manual' && selectedBlocks.length > 0) {
        const selectedBlockNames = availableBlocks
          .filter(block => selectedBlocks.includes(block.id))
          .map(block => block.name);
        requestBody.preferredBlocks = selectedBlockNames;
      }

      const response = await fetch(`/api/admin/products/${productId}/generate-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reviews Generated Successfully!",
          description: `Generated ${data.data.totalGenerated} reviews with ${data.data.statistics.averageRating}⭐ average rating.`
        });

        // Call the callback to refresh parent component
        if (onGenerated) {
          onGenerated(data.data);
        }

        // Close modal after successful generation
        onClose();
      } else {
        throw new Error(data.message || 'Generation failed');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetModal = () => {
    setSelectedCount(null);
    setIncludeImages(false);
    setIsGenerating(false);
    setShowRegenerateOption(false);
    setSelectedBlocks([]);
    setSelectionMode('auto');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Generate Product Reviews
          </DialogTitle>
          <DialogDescription>
            Generate authentic Pakistani-style reviews for "{productTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Reviews Warning */}
          {showRegenerateOption && existingReviews && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    Existing Generated Reviews Found
                  </span>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  This product already has {existingReviews.generated} generated reviews. 
                  You can add more or regenerate all reviews.
                </p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">
                    {existingReviews.total} Total Reviews
                  </Badge>
                  <Badge variant="outline">
                    {existingReviews.averageRating}⭐ Average
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Options */}
          {generationOptions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Available Blocks:</Label>
                    <p>{generationOptions.reviewGeneration.blockInfo.totalBlocks}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Average Rating:</Label>
                    <p>{generationOptions.reviewGeneration.blockInfo.averageRating}⭐</p>
                  </div>
                  <div>
                    <Label className="font-medium">Reviews per Block:</Label>
                    <p>{generationOptions.reviewGeneration.blockInfo.reviewsPerBlock}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Image Support:</Label>
                    <p>{generationOptions.imageUpload.maxImagesPerReview} images/review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Block Selection Mode */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Block Selection Mode
            </Label>
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectionMode === 'auto' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectionMode('auto');
                  setSelectedBlocks([]);
                }}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Auto Select
              </Button>
              <Button
                variant={selectionMode === 'manual' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectionMode('manual')}
              >
                <List className="h-4 w-4 mr-2" />
                Choose Blocks
              </Button>
            </div>
            
            {selectionMode === 'manual' && availableBlocks.length > 0 && (
              <Card className="p-4">
                <Label className="font-medium mb-3 block">
                  Select Review Blocks ({selectedBlocks.length} selected)
                </Label>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {availableBlocks.map((block) => (
                      <div key={block.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                        <Checkbox
                          id={`block-${block.id}`}
                          checked={selectedBlocks.includes(block.id)}
                          onCheckedChange={(checked) => handleBlockSelection(block.id, checked)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`block-${block.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {block.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {block.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {block.reviewCount} reviews
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </div>

          {/* Review Count Selection */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Select Number of Reviews to Generate
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviewCountOptions.map((option) => (
                <Card 
                  key={option.count}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCount === option.count 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCount(option.count)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {option.count}
                      </span>
                      <Badge variant="secondary">
                        {option.blocks} blocks
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {option.estimatedTime}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Image Options */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Additional Options
            </Label>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Include Image Placeholders</Label>
                    <p className="text-sm text-muted-foreground">
                      Prepare reviews for image uploads later
                    </p>
                  </div>
                </div>
                <Button
                  variant={includeImages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIncludeImages(!includeImages)}
                >
                  {includeImages ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleGenerate(false)}
              disabled={!selectedCount || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Generate {selectedCount} Reviews
                </>
              )}
            </Button>

            {showRegenerateOption && (
              <Button
                onClick={() => handleGenerate(true)}
                disabled={!selectedCount || isGenerating}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate All
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {isGenerating && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Generating {selectedCount} reviews...
                    </p>
                    <p className="text-sm text-blue-600">
                      Using authentic Pakistani-style content blocks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewGeneratorModal;