import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Edit, Save, X, User, Mail, Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { useToast } from "../ui/use-toast";

function UserProfile() {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/shop/profile/${user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.data);
        setEditForm({
          userName: data.data.userName,
          email: data.data.email
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Error loading profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setEditForm({
        userName: profileData.userName,
        email: profileData.email
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!editForm.userName.trim() || !editForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Username and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/shop/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          userName: data.data.userName,
          email: data.data.email
        }));
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Error updating profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Failed to load profile data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={isEditing ? handleEditToggle : handleEditToggle}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {getInitials(profileData.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{profileData.userName}</h3>
              <p className="text-gray-600">{profileData.email}</p>
              <Badge variant="secondary" className="text-xs">
                Registered User
              </Badge>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    value={editForm.userName}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      userName: e.target.value
                    }))}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Username:</span>
                <span>{profileData.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Member since:</span>
                <span>{formatDate(profileData.joinDate)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {profileData.stats.totalOrders}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${profileData.stats.totalSpent.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {profileData.stats.lastOrderDate ? 
                  formatDate(profileData.stats.lastOrderDate) : 
                  'No orders yet'
                }
              </div>
              <div className="text-sm text-gray-600">Last Order</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;