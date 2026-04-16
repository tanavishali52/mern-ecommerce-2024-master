const Order = require("../../models/Order");
const { handleError, sendSuccessResponse, sendNotFoundResponse } = require("../../utils/errorHandler");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    // Return empty array instead of 404 when no orders exist
    return sendSuccessResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (error) {
    return handleError(res, error, 'Error occurred while fetching orders');
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return sendNotFoundResponse(res, 'Order');
    }

    return sendSuccessResponse(res, 200, 'Order details fetched successfully', order);
  } catch (error) {
    return handleError(res, error, 'Error occurred while fetching order details');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    // Get admin info from request (assuming admin middleware sets req.user)
    const adminInfo = {
      adminId: req.user?.id || 'unknown',
      adminName: req.user?.userName || req.user?.name || 'Admin',
      adminEmail: req.user?.email || 'admin@system.com'
    };

    const order = await Order.findById(id);

    if (!order) {
      return sendNotFoundResponse(res, 'Order');
    }

    // Create status history entry
    const statusHistoryEntry = {
      status: orderStatus,
      updatedBy: adminInfo,
      updatedAt: new Date(),
      notes: `Status changed from ${order.orderStatus} to ${orderStatus}`
    };

    // Update order with new status and admin tracking
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      { 
        orderStatus,
        orderUpdateDate: new Date(),
        lastUpdatedBy: {
          ...adminInfo,
          updatedAt: new Date()
        },
        $push: { statusHistory: statusHistoryEntry }
      },
      { new: true } // Return updated document
    );

    return sendSuccessResponse(res, 200, 'Order status updated successfully', updatedOrder);
  } catch (error) {
    return handleError(res, error, 'Error occurred while updating order status');
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
