const User = require("../../models/User");
const Order = require("../../models/Order");

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate user statistics
    const orders = await Order.find({ userId: userId });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const lastOrder = orders.length > 0 ? orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0] : null;

    // Prepare profile data
    const profileData = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      joinDate: user._id.getTimestamp(), // Extract creation date from ObjectId
      stats: {
        totalOrders: totalOrders,
        totalSpent: totalSpent,
        lastOrderDate: lastOrder ? lastOrder.orderDate : null
      }
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user profile"
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName, email } = req.body;

    // Validate input
    if (!userName || !email) {
      return res.status(400).json({
        success: false,
        message: "Username and email are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ userName: userName }, { email: email }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.userName === userName ? 
          "Username already exists" : 
          "Email already exists"
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating user profile"
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get detailed order statistics
    const orders = await Order.find({ userId: userId });
    
    // Calculate various statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Order status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      const status = order.orderStatus || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
      .map(order => ({
        _id: order._id,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        itemCount: order.cartItems ? order.cartItems.length : 0
      }));

    // Monthly spending (last 12 months)
    const monthlySpending = {};
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpending[monthKey] = 0;
    }

    orders.forEach(order => {
      if (order.orderDate) {
        const orderDate = new Date(order.orderDate);
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlySpending.hasOwnProperty(monthKey)) {
          monthlySpending[monthKey] += order.totalAmount || 0;
        }
      }
    });

    const stats = {
      totalOrders,
      totalSpent,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      statusBreakdown,
      recentOrders,
      monthlySpending,
      lastOrderDate: orders.length > 0 ? 
        Math.max(...orders.map(o => new Date(o.orderDate).getTime())) : null,
      firstOrderDate: orders.length > 0 ? 
        Math.min(...orders.map(o => new Date(o.orderDate).getTime())) : null
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user statistics"
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats,
};