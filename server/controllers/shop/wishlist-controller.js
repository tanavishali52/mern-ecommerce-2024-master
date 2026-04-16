const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // skip check if optionalAuth allowed it

    if (!userId || !productId) {
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
    else query = { sessionId: userId };

    let wishlist = await Wishlist.findOne(query);

    if (!wishlist) {
      wishlist = new Wishlist(req.user ? { userId: req.user.id, items: [] } : { sessionId: userId, items: [] });
    }

    const findCurrentProductIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      wishlist.items.push({ productId });
    } else {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    await wishlist.save();
    await wishlist.populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    const populateWishlistItems = wishlist.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      addedAt: item.addedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populateWishlistItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
    });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;

    // skip check

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    let query = {};
    if (req.user) query = { userId: req.user.id };
    else query = { sessionId: userId };

    const wishlist = await Wishlist.findOne(query).populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          items: [],
        },
      });
    }

    const validItems = wishlist.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < wishlist.items.length) {
      wishlist.items = validItems;
      await wishlist.save();
    }

    const populateWishlistItems = validItems.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      addedAt: item.addedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populateWishlistItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
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

    const wishlist = await Wishlist.findOne(query);

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate({
      path: "items.productId",
      select: "images image title price salePrice",
    });

    const populateWishlistItems = wishlist.items.map((item) => ({
      productId: item.productId._id,
      images: item.productId.images,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      addedAt: item.addedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items: populateWishlistItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
};