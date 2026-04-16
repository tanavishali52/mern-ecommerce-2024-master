const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems: cartItems.map(item => ({
            ...item,
            images: item.images || (item.image ? [{ url: item.image }] : [])
          })),
          addressInfo,
          isGuest: false, // Mark as registered user order
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });

    // Return empty array instead of 404 when no orders found
    res.status(200).json({
      success: true,
      data: orders || [], // Ensure we always return an array
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const createGuestOrder = async (req, res) => {
  try {
    const {
      product,
      customer,
      totalAmount,
      paymentMethod = "cod"
    } = req.body;

    // Validate required fields for guest order
    if (!product || !customer) {
      return res.status(400).json({
        success: false,
        message: "Product and customer information are required"
      });
    }

    if (!customer.fullName || !customer.phoneNumber || !customer.shippingAddress || !customer.city) {
      return res.status(400).json({
        success: false,
        message: "All customer fields are required (fullName, phoneNumber, shippingAddress, city)"
      });
    }

    // Check if product exists and has stock
    const productExists = await Product.findById(product._id);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (productExists.totalStock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock"
      });
    }

    // Create cart items array for guest order
    const cartItems = [{
      productId: product._id,
      title: product.title,
      price: product.price.toString(),
      quantity: 1,
      images: product.images || [],
      image: product.image || ""
    }];

    // Create new guest order
    const newGuestOrder = new Order({
      userId: null, // No user ID for guest orders
      cartId: null, // No cart for guest orders
      cartItems,
      guestCustomer: {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        shippingAddress: customer.shippingAddress,
        city: customer.city
      },
      isGuest: true, // Mark as guest order
      orderStatus: "pending",
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      totalAmount: totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date()
    });

    await newGuestOrder.save();

    // Update product stock
    productExists.totalStock -= 1;
    await productExists.save();

    res.status(201).json({
      success: true,
      message: "Guest order created successfully",
      data: {
        orderId: newGuestOrder._id,
        orderNumber: `ORD-${newGuestOrder._id.toString().slice(-6).toUpperCase()}`,
        status: "confirmed",
        totalAmount: totalAmount,
        paymentMethod: paymentMethod
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create guest order"
    });
  }
};

const createUnifiedOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      guestCustomer,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Determine if this is a guest order or registered user order
    const isGuest = !userId;

    // Validate required fields based on order type
    if (isGuest) {
      if (!guestCustomer || !guestCustomer.fullName || !guestCustomer.phoneNumber || !guestCustomer.shippingAddress || !guestCustomer.city) {
        return res.status(400).json({
          success: false,
          message: "Guest customer information is required (fullName, phoneNumber, shippingAddress, city)"
        });
      }
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required"
      });
    }

    // Validate product stock for all items
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.title}. Available: ${product.totalStock}, Requested: ${item.quantity}`
        });
      }
    }

    // Create order data
    const orderData = {
      userId: isGuest ? null : userId,
      cartId: cartId || null,
      cartItems: cartItems.map(item => ({
        ...item,
        images: item.images || (item.image ? [{ url: item.image }] : [])
      })),
      addressInfo: addressInfo || {},
      guestCustomer: isGuest ? guestCustomer : null,
      orderStatus: orderStatus || "pending",
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentStatus || "pending",
      totalAmount: totalAmount,
      orderDate: orderDate || new Date(),
      orderUpdateDate: orderUpdateDate || new Date(),
      paymentId: paymentId || "",
      payerId: payerId || "",
      isGuest: isGuest
    };

    // For COD orders, create order directly
    if (paymentMethod === "cod") {
      const newOrder = new Order(orderData);
      
      // Add initial status to timeline
      newOrder.addStatusUpdate("confirmed", "Order confirmed - Cash on Delivery");
      
      await newOrder.save();

      // Update product stock
      for (let item of cartItems) {
        const product = await Product.findById(item.productId);
        product.totalStock -= item.quantity;
        await product.save();
      }

      // Clear cart if it exists (for registered users)
      if (cartId) {
        await Cart.findByIdAndDelete(cartId);
      }

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        orderId: newOrder._id,
        data: {
          orderId: newOrder._id,
          orderNumber: `ORD-${newOrder._id.toString().slice(-6).toUpperCase()}`,
          status: "confirmed",
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          isGuest: isGuest,
          customerName: isGuest ? guestCustomer.fullName : null
        }
      });
    }

    // For PayPal orders, create payment first
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5175/shop/paypal-return",
        cancel_url: "http://localhost:5175/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "Order payment",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newOrder = new Order(orderData);
        await newOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newOrder._id,
        });
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

const getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Return the status timeline
    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        currentStatus: order.orderStatus,
        timeline: order.statusTimeline || [],
        lastUpdated: order.orderUpdateDate
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving order timeline"
    });
  }
};

const generateSupportContact = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get customer name (guest or registered user)
    let customerName = 'Customer';
    if (order.isGuestOrder && order.guestCustomer) {
      customerName = order.guestCustomer.fullName;
    } else if (order.customerDisplayName) {
      customerName = order.customerDisplayName;
    }

    // Generate WhatsApp support message
    const supportMessage = `Hi! I need help with my order.

Order Details:
- Order ID: ${order._id}
- Customer: ${customerName}
- Status: ${order.orderStatus}
- Date: ${order.orderDate.toLocaleDateString()}
- Total: $${order.totalAmount}

Please assist me with this order.`;

    // Get merchant WhatsApp number from settings (fallback to default)
    const merchantWhatsApp = process.env.MERCHANT_WHATSAPP || '+1234567890';

    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${merchantWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(supportMessage)}`;

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        customerName: customerName,
        whatsappUrl: whatsappUrl,
        supportMessage: supportMessage,
        merchantWhatsApp: merchantWhatsApp,
        alternativeContact: {
          phone: merchantWhatsApp,
          email: process.env.MERCHANT_EMAIL || 'support@example.com'
        }
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error generating support contact information"
    });
  }
};

const getOrdersByGuestName = async (req, res) => {
  try {
    const { guestName } = req.params;

    // Validate guest name parameter
    if (!guestName || guestName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Guest name is required"
      });
    }

    // Sanitize and prepare search term
    const searchName = guestName.trim();
    const searchNameLower = searchName.toLowerCase();

    // Find orders by guest name (case-insensitive)
    const orders = await Order.find({
      $and: [
        { isGuestOrder: true },
        {
          $or: [
            { guestNameLowercase: searchNameLower },
            { "guestCustomer.fullName": { $regex: new RegExp(searchName, 'i') } }
          ]
        }
      ]
    }).sort({ orderDate: -1 }); // Sort by newest first

    // Return results (empty array if no orders found)
    res.status(200).json({
      success: true,
      data: orders,
      message: orders.length === 0 ? 
        `No orders found for "${searchName}". Please check the name and try again.` : 
        `Found ${orders.length} order(s) for "${searchName}"`
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving guest orders"
    });
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  createUnifiedOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrdersByGuestName,
  getOrderDetails,
  getOrderTimeline,
  generateSupportContact,
};
