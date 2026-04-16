const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // Made optional for guest orders
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      images: [{
        url: String,
        public_id: String
      }],
      image: String, // Keep for backwards compatibility
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  // New guest customer fields
  guestCustomer: {
    fullName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    shippingAddress: { type: String, required: false },
    city: { type: String, required: false }
  },
  // Flag to identify guest orders
  isGuest: { type: Boolean, default: false },
  // Enhanced fields for guest lookup and order management
  guestNameLowercase: { type: String, required: false }, // For case-insensitive search
  isGuestOrder: { type: Boolean, default: false }, // Consistent naming with design
  customerDisplayName: { type: String, required: false }, // Computed field for display
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,
  // Enhanced timeline tracking
  statusTimeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  // Admin tracking for status updates (keep existing)
  statusHistory: [{
    status: String,
    updatedBy: {
      adminId: String,
      adminName: String,
      adminEmail: String
    },
    updatedAt: { type: Date, default: Date.now },
    notes: String
  }],
  lastUpdatedBy: {
    adminId: String,
    adminName: String,
    adminEmail: String,
    updatedAt: { type: Date, default: Date.now }
  },
});

// Pre-save middleware to populate computed fields
OrderSchema.pre('save', function(next) {
  // Set isGuestOrder flag based on presence of guestCustomer data
  if (this.guestCustomer && this.guestCustomer.fullName) {
    this.isGuestOrder = true;
    this.isGuest = true; // Keep for backwards compatibility
    this.guestNameLowercase = this.guestCustomer.fullName.toLowerCase();
    this.customerDisplayName = this.guestCustomer.fullName;
  } else if (this.userId) {
    this.isGuestOrder = false;
    this.isGuest = false;
    // customerDisplayName will be populated from user data in controller
  }

  // Initialize statusTimeline if not exists and orderStatus is set
  if (this.orderStatus && (!this.statusTimeline || this.statusTimeline.length === 0)) {
    this.statusTimeline = [{
      status: this.orderStatus,
      timestamp: this.orderDate || new Date(),
      note: 'Order created'
    }];
  }

  next();
});

// Method to add status update to timeline
OrderSchema.methods.addStatusUpdate = function(status, note = '') {
  this.statusTimeline.push({
    status: status,
    timestamp: new Date(),
    note: note
  });
  this.orderStatus = status;
  this.orderUpdateDate = new Date();
};

module.exports = mongoose.model("Order", OrderSchema);
