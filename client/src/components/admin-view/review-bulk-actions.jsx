import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/use-toast";
import { 
  Trash2, 
  RotateCcw, 
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  Download,
  Upload
} from "lucide-react";

const ReviewBulkActions = ({ 
  selectedReviews, 
  onSelectionChange, 
  onBulkAction, 
  totalReviews,
  productId 
}) => {
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedReviews.length === totalReviews) {
      onSelectionChange([]);
    } else {
      // In a real implementation, you'd need to get all review IDs
      // For now, we'll just clear the selection
      onSelectionChange([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;

    setIsProcessing(true);
    setBulkActionType('delete');

    try {
      const deletePromises = selectedReviews.map(reviewId =>
        fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast({
          title: "Bulk Delete Completed",
          description: `Successfully deleted ${successful} reviews${failed > 0 ? `, ${failed} failed` : ''}.`
        });

        onBulkAction('delete', { successful, failed });
        onSelectionChange([]);
      }
    } catch (error) {
      toast({
        title: "Bulk Delete Failed",
        description: "An error occurred during bulk deletion.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setBulkActionType('');
      setShowBulkDeleteDialog(false);
    }
  };

  const handleRegenerateAll = async (reviewCount) => {
    setIsProcessing(true);
    setBulkActionType('regenerate');

    try {
      const response = await fetch(`/api/admin/products/${productId}/generate-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalReviews: reviewCount,
          regenerate: true
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reviews Regenerated",
          description: `Successfully regenerated ${data.data.totalGenerated} reviews.`
        });

        onBulkAction('regenerate', data.data);
        onSelectionChange([]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate reviews.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setBulkActionType('');
      setShowRegenerateDialog(false);
    }
  };

  const exportReviews = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/reviews?limit=1000`);
      const data = await response.json();

      if (data.success) {
        const csvContent = [
          ['Username', 'Rating', 'Comment', 'Type', 'Date'].join(','),
          ...data.data.reviews.map(review => [
            `"${review.userName}"`,
            review.reviewValue,
            `"${review.reviewMessage.replace(/"/g, '""')}"`,
            review.isGenerated ? 'Generated' : 'Real',
            new Date(review.createdAt).toLocaleDateString()
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reviews-${productId}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Exported ${data.data.reviews.length} reviews to CSV.`
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export reviews.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Actions
          </div>
          <Badge variant="secondary">
            {selectedReviews.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedReviews.length === totalReviews ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedReviews.length === totalReviews ? 'Deselect All' : 'Select All'}
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {selectedReviews.length} of {totalReviews} reviews selected
            </span>
          </div>

          <Separator />

          {/* Bulk Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedReviews.length === 0 || isProcessing}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Confirm Bulk Delete
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    Are you sure you want to delete {selectedReviews.length} selected reviews? 
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkDeleteDialog(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={isProcessing}
                    >
                      {isProcessing && bulkActionType === 'delete' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete {selectedReviews.length} Reviews
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Regenerate All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Regenerate All Reviews
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    This will delete all existing generated reviews and create new ones. 
                    Real customer reviews will not be affected.
                  </p>
                  
                  <div>
                    <label className="text-sm font-medium">Number of reviews to generate:</label>
                    <Select defaultValue="20">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 reviews (1 block)</SelectItem>
                        <SelectItem value="20">20 reviews (4 blocks)</SelectItem>
                        <SelectItem value="50">50 reviews (10 blocks)</SelectItem>
                        <SelectItem value="100">100 reviews (20 blocks)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowRegenerateDialog(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const select = document.querySelector('[role="combobox"]');
                        const value = select?.getAttribute('data-value') || '20';
                        handleRegenerateAll(parseInt(value));
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && bulkActionType === 'regenerate' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Regenerate Reviews
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={exportReviews}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={true} // Placeholder for future import feature
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import (Soon)
            </Button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">
                      {bulkActionType === 'delete' && 'Deleting selected reviews...'}
                      {bulkActionType === 'regenerate' && 'Regenerating all reviews...'}
                    </p>
                    <p className="text-sm text-blue-600">
                      Please wait while the operation completes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewBulkActions;