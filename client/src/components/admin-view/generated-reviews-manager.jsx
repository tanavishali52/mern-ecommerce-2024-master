import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/use-toast";
import { 
  Star, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Filter,
  RotateCcw,
  Users,
  TrendingUp,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

const GeneratedReviewsManager = ({ 
  productId, 
  productTitle, 
  onStatsUpdate,
  searchTerm = "",
  filters = {},
  selectedReviews = [],
  onSelectionChange = () => {}
}) => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [localFilters, setLocalFilters] = useState({
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    limit: 10
  });
  const { toast } = useToast();

  // Use passed filters or local filters
  const activeFilters = Object.keys(filters).length > 0 ? filters : localFilters;

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, activeFilters, pagination.currentPage]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        type: activeFilters.type,
        sortBy: activeFilters.sortBy,
        sortOrder: activeFilters.sortOrder
      });

      const response = await fetch(`/api/admin/products/${productId}/reviews?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setStatistics(data.data.statistics);
        setPagination(prev => ({
          ...prev,
          ...data.data.pagination
        }));

        // Update parent component with stats
        if (onStatsUpdate) {
          onStatsUpdate(data.data.statistics);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setEditForm({
      userName: review.userName,
      reviewMessage: review.reviewMessage,
      reviewValue: review.reviewValue
    });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Review Updated",
          description: "Review has been updated successfully"
        });
        
        setEditingReview(null);
        setEditForm({});
        fetchReviews(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update review",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReview = async (reviewId, userName) => {
    if (!confirm(`Are you sure you want to delete the review by ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Review Deleted",
          description: `Review by ${userName} has been deleted`
        });
        
        fetchReviews(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({});
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderEditStars = (rating, onChange) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300 hover:text-yellow-200'
        }`}
        onClick={() => onChange(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Review Statistics for "{productTitle}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{statistics.total}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.generated}</div>
                <div className="text-sm text-muted-foreground">Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.real}</div>
                <div className="text-sm text-muted-foreground">Real Reviews</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-yellow-600">
                    {statistics.averageRating}
                  </span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      {Object.keys(filters).length === 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label>Filter:</Label>
                <Select 
                  value={localFilters.type} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reviews</SelectItem>
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="real">Real Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Sort by:</Label>
                <Select 
                  value={localFilters.sortBy} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="reviewValue">Rating</SelectItem>
                    <SelectItem value="userName">Username</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Order:</Label>
                <Select 
                  value={localFilters.sortOrder} 
                  onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground">
                {filters.type === 'generated' 
                  ? "No generated reviews found for this product."
                  : "No reviews found with the current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id} className="relative">
              <CardContent className="p-4">
                {editingReview === review._id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userName">Username</Label>
                        <Input
                          id="userName"
                          value={editForm.userName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, userName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {renderEditStars(editForm.reviewValue, (rating) => 
                            setEditForm(prev => ({ ...prev, reviewValue: rating }))
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviewMessage">Review Message</Label>
                      <Textarea
                        id="reviewMessage"
                        value={editForm.reviewMessage}
                        onChange={(e) => setEditForm(prev => ({ ...prev, reviewMessage: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveEdit(review._id)} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{review.userName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                              {renderStars(review.reviewValue)}
                            </div>
                            <Badge variant={review.isGenerated ? "secondary" : "default"} className="text-xs">
                              {review.isGenerated ? "Generated" : "Real"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditReview(review)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteReview(review._id, review.userName)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {review.reviewMessage}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        {review.images.length} image{review.images.length > 1 ? 's' : ''}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                      {review.isGenerated && review.blockId && (
                        <Badge variant="outline" className="text-xs">
                          Block {review.blockId}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalReviews)} of{' '}
                {pagination.totalReviews} reviews
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneratedReviewsManager;