import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/use-toast";
import GeneratedReviewsManager from "./generated-reviews-manager";
import ReviewBulkActions from "./review-bulk-actions";
import ReviewGeneratorModal from "./review-generator-modal";
import { 
  Search, 
  Filter,
  TrendingUp,
  Users,
  Star,
  Calendar,
  BarChart3,
  Plus,
  RefreshCw,
  Settings
} from "lucide-react";

const ReviewManagementDashboard = ({ product }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    rating: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (product?._id) {
      fetchReviewStats();
    }
  }, [product?._id]);

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`/api/admin/products/${product._id}/reviews?limit=1`);
      const data = await response.json();
      
      if (data.success) {
        setReviewStats(data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReviewStats();
    setIsRefreshing(false);
    
    toast({
      title: "Data Refreshed",
      description: "Review statistics have been updated."
    });
  };

  const handleBulkAction = (action, result) => {
    // Refresh stats after bulk actions
    fetchReviewStats();
    
    if (action === 'delete') {
      toast({
        title: "Bulk Action Completed",
        description: `${result.successful} reviews deleted successfully.`
      });
    } else if (action === 'regenerate') {
      toast({
        title: "Reviews Regenerated",
        description: `Generated ${result.totalGenerated} new reviews.`
      });
    }
  };

  const handleReviewGenerated = (generationResult) => {
    fetchReviewStats();
    setActiveTab("manage");
  };

  const renderStatsCard = (title, value, icon, color = "primary") => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold text-${color}`}>{value}</p>
          </div>
          <div className={`p-2 bg-${color}/10 rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRatingDistribution = () => {
    if (!reviewStats) return null;

    // Mock rating distribution - in real app, this would come from API
    const distribution = {
      5: Math.floor(reviewStats.total * 0.5),
      4: Math.floor(reviewStats.total * 0.3),
      3: Math.floor(reviewStats.total * 0.15),
      2: Math.floor(reviewStats.total * 0.04),
      1: Math.floor(reviewStats.total * 0.01)
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ 
                      width: `${reviewStats.total > 0 ? (distribution[rating] / reviewStats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Review Management Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage reviews for "{product?.title}"
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowGeneratorModal(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Reviews
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Reviews</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {reviewStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {renderStatsCard(
                "Total Reviews", 
                reviewStats.total, 
                <Users className="h-5 w-5 text-primary" />
              )}
              {renderStatsCard(
                "Generated", 
                reviewStats.generated, 
                <Settings className="h-5 w-5 text-green-600" />,
                "green-600"
              )}
              {renderStatsCard(
                "Real Reviews", 
                reviewStats.real, 
                <Star className="h-5 w-5 text-blue-600" />,
                "blue-600"
              )}
              {renderStatsCard(
                "Average Rating", 
                `${reviewStats.averageRating}⭐`, 
                <TrendingUp className="h-5 w-5 text-yellow-600" />,
                "yellow-600"
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            {renderRatingDistribution()}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewStats && reviewStats.lastGenerated && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Last Generation</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reviewStats.lastGenerated).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">Generated</Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Review System</p>
                      <p className="text-xs text-muted-foreground">Active and monitoring</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowGeneratorModal(true)}
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Generate Reviews</div>
                    <div className="text-xs opacity-90">Add new reviews</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab("manage")}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manage Reviews</div>
                    <div className="text-xs opacity-70">Edit and organize</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab("bulk")}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                >
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Bulk Actions</div>
                    <div className="text-xs opacity-70">Mass operations</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-64">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews by username or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="real">Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select 
                  value={filters.rating} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Manager */}
          <GeneratedReviewsManager 
            productId={product?._id}
            productTitle={product?.title}
            onStatsUpdate={setReviewStats}
            searchTerm={searchTerm}
            filters={filters}
            selectedReviews={selectedReviews}
            onSelectionChange={setSelectedReviews}
          />
        </TabsContent>

        <TabsContent value="bulk">
          <ReviewBulkActions
            selectedReviews={selectedReviews}
            onSelectionChange={setSelectedReviews}
            onBulkAction={handleBulkAction}
            totalReviews={reviewStats?.total || 0}
            productId={product?._id}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Generation Options</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Available Counts:</span>
                      <Badge variant="outline">5, 20, 50, 100</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Review Blocks:</span>
                      <Badge variant="outline">20 blocks</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Reviews per Block:</span>
                      <Badge variant="outline">5 reviews</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Rating:</span>
                      <Badge variant="outline">4.2-4.7 ⭐</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Management Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bulk Operations:</span>
                      <Badge variant="outline">✓ Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Export/Import:</span>
                      <Badge variant="outline">CSV Support</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Inline Editing:</span>
                      <Badge variant="outline">✓ Available</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Image Support:</span>
                      <Badge variant="outline">5 per review</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Generator Modal */}
      <ReviewGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        productId={product?._id}
        productTitle={product?.title}
        onGenerated={handleReviewGenerated}
      />
    </div>
  );
};

export default ReviewManagementDashboard;