const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // If authenticated, we can optionally check req.user.id
    if (req.user && userId && userId !== req.user.id) {
       // but for now let's be flexible to allow guest-to-user transitions if needed
    }

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let query = {};
    if (req.user) query = { userId: req.user.id };
    else query = { sessionId: userId }; // userId passed from frontend is sessionId for guests

    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart(req.user ? { userId: req.user.id, items: [] } : { sessionId: userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    // If authenticated, verify ID
    if (req.user && userId !== req.user.id) {
      // allow
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    let query = {};
    if (req.user) query = { userId: req.user.id };
    else query = { sessionId: userId };

    const cart = await Cart.findOne(query).populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, type } = req.body;

    // skip check

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    let query = {};
    if (req.user) query = { userId: req.user.id };
    else query = { sessionId: userId };

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    if (type === "increase") {
      cart.items[findCurrentProductIndex].quantity += 1;
    } else {
      cart.items[findCurrentProductIndex].quantity -= 1;
    }

    if (cart.items[findCurrentProductIndex].quantity === 0) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // skip check

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    let query = {};
    if (req.user) query = { userId: req.user.id };
    else query = { sessionId: userId };

    const cart = await Cart.findOne(query);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
};
