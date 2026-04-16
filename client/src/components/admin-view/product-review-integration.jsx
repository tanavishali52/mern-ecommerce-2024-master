import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import ReviewGeneratorModal from "./review-generator-modal";
import GeneratedReviewsManager from "./generated-reviews-manager";
import { 
  Star, 
  Plus, 
  BarChart3, 
  Settings, 
  Users,
  TrendingUp
} from "lucide-react";

const ProductReviewIntegration = ({ product }) => {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleReviewGenerated = (generationResult) => {
    // Update local stats when reviews are generated
    setReviewStats(prev => ({
      ...prev,
      generated: (prev?.generated || 0) + generationResult.totalGenerated,
      total: (prev?.total || 0) + generationResult.totalGenerated,
      averageRating: generationResult.statistics.averageRating
    }));
  };

  const handleStatsUpdate = (newStats) => {
    setReviewStats(newStats);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Review Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate and manage reviews for "{product?.title}"
              </p>
            </div>
            <Button 
              onClick={() => setShowGeneratorModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Generate Reviews
            </Button>
          </div>
        </CardHeader>

        {/* Quick Stats */}
        {reviewStats && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-primary">{reviewStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Reviews</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{reviewStats.generated}</div>
                <div className="text-xs text-muted-foreground">Generated</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{reviewStats.real}</div>
                <div className="text-xs text-muted-foreground">Real Reviews</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-bold text-yellow-600">
                    {reviewStats.averageRating}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Reviews
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Review Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Review Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Generated Reviews</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${reviewStats.total > 0 ? (reviewStats.generated / reviewStats.total) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{reviewStats.generated}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Real Reviews</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ 
                                  width: `${reviewStats.total > 0 ? (reviewStats.real / reviewStats.total) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{reviewStats.real}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Rating Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{reviewStats.averageRating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Reviews</span>
                          <span className="font-medium">{reviewStats.total}</span>
                        </div>
                        {reviewStats.generatedBlocks && (
                          <div className="flex justify-between">
                            <span className="text-sm">Blocks Used</span>
                            <span className="font-medium">{reviewStats.generatedBlocks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowGeneratorModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add More Reviews
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("manage")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Manage Reviews
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate authentic Pakistani-style reviews to get started.
                  </p>
                  <Button 
                    onClick={() => setShowGeneratorModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate First Reviews
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <GeneratedReviewsManager 
            productId={product?._id}
            productTitle={product?.title}
            onStatsUpdate={handleStatsUpdate}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Available Options</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Review Counts:</span>
                      <Badge variant="outline">5, 20, 50, 100</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Blocks:</span>
                      <Badge variant="outline">20 blocks</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Reviews per Block:</span>
                      <Badge variant="outline">5 reviews</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <Badge variant="outline">4.2-4.7 ⭐</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Image Support</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Images per Review:</span>
                      <Badge variant="outline">5 images</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Supported Formats:</span>
                      <Badge variant="outline">JPG, PNG, WebP</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Max File Size:</span>
                      <Badge variant="outline">5MB</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowGeneratorModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Reviews
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("manage")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    View All Reviews
                  </Button>
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

export default ProductReviewIntegration;