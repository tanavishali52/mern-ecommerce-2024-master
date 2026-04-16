import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { StarIcon, ChevronDownIcon, ChevronUpIcon, ImageIcon, VerifiedIcon } from "lucide-react";
import ReviewImageGallery from "../admin-view/review-image-gallery";

const EnhancedReviewDisplay = ({ 
  reviews = [], 
  productId,
  showPagination = true,
  itemsPerPage = 5,
  showFilters = true
}) => {
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showImages, setShowImages] = useState('all');

  // Filter and sort reviews
  useEffect(() => {
    let filteredReviews = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filteredReviews = filteredReviews.filter(
        review => review.reviewValue === parseInt(filterRating)
      );
    }

    // Filter by image presence
    if (showImages === 'with-images') {
      filteredReviews = filteredReviews.filter(
        review => review.images && review.images.length > 0
      );
    } else if (showImages === 'without-images') {
      filteredReviews = filteredReviews.filter(
        review => !review.images || review.images.length === 0
      );
    }

    // Sort reviews
    switch (sortBy) {
      case 'newest':
        filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest-rating':
        filteredReviews.sort((a, b) => b.reviewValue - a.reviewValue);
        break;
      case 'lowest-rating':
        filteredReviews.sort((a, b) => a.reviewValue - b.reviewValue);
        break;
      default:
        break;
    }

    // Paginate reviews
    if (showPagination) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayedReviews(filteredReviews.slice(startIndex, endIndex));
    } else {
      setDisplayedReviews(filteredReviews);
    }
  }, [reviews, currentPage, itemsPerPage, filterRating, sortBy, showImages, showPagination]);

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getReviewTypeInfo = (review) => {
    if (review.isGenerated) {
      return {
        type: 'Verified Purchase',
        color: 'bg-green-100 text-green-800',
        icon: <VerifiedIcon className="w-3 h-3" />
      };
    } else {
      return {
        type: 'Verified Purchase',
        color: 'bg-green-100 text-green-800',
        icon: <VerifiedIcon className="w-3 h-3" />
      };
    }
  };

  const totalPages = showPagination ? Math.ceil(reviews.length / itemsPerPage) : 1;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <StarIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by rating:</span>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest-rating">Highest rating</option>
                  <option value="lowest-rating">Lowest rating</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Images:</span>
                <select
                  value={showImages}
                  onChange={(e) => setShowImages(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All reviews</option>
                  <option value="with-images">With images</option>
                  <option value="without-images">Without images</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.map((review) => {
          const isExpanded = expandedReviews.has(review._id);
          const reviewTypeInfo = getReviewTypeInfo(review);
          const shouldTruncate = review.reviewMessage.length > 200;
          const displayMessage = shouldTruncate && !isExpanded 
            ? review.reviewMessage.substring(0, 200) + '...'
            : review.reviewMessage;

          return (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                          {review.userName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {review.userName}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${reviewTypeInfo.color}`}
                          >
                            {reviewTypeInfo.icon}
                            {reviewTypeInfo.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {renderStars(review.reviewValue)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Images Indicator */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ImageIcon className="w-4 h-4" />
                        <span>{review.images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      {displayMessage}
                    </p>

                    {/* Expand/Collapse Button */}
                    {shouldTruncate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReviewExpansion(review._id)}
                        className="text-orange-600 hover:text-orange-700 p-0 h-auto font-medium"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUpIcon className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDownIcon className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="pt-2">
                        <ReviewImageGallery
                          images={review.images}
                          reviewId={review._id}
                          reviewUserName={review.userName}
                          showControls={false}
                          compact={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Review Metadata - Hidden for generated reviews */}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, reviews.length)} of{' '}
            {reviews.length} reviews
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          {reviews.length} total review{reviews.length !== 1 ? 's' : ''} • 
          Average rating: {(reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length).toFixed(1)} stars
        </div>
      </div>
    </div>
  );
};

export default EnhancedReviewDisplay;