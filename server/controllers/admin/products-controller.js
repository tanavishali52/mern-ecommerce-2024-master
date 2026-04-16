const { imageUploadUtil } = require("../../helpers/cloudinary");
const cloudinary = require("cloudinary").v2;
const Product = require("../../models/Product");
const Feature = require("../../models/Feature");
const { handleError, sendSuccessResponse, sendNotFoundResponse, sendErrorResponse } = require("../../utils/errorHandler");

const handleImageUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendErrorResponse(res, 400, 'No files uploaded', {
        field: 'files',
        message: 'At least one file must be uploaded'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const url = "data:" + file.mimetype + ";base64," + b64;
      return await imageUploadUtil(url);
    });

    const results = await Promise.all(uploadPromises);

    return sendSuccessResponse(res, 200, 'Images uploaded successfully', { results });
  } catch (error) {
    return handleError(res, error, 'Error occurred while uploading images');
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      department,
      primaryCategory,
      subCategories,
      brand,
      price,
      salePrice,
      totalStock,
      images,
    } = req.body;

    // Enhanced validation with detailed error messages
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!brand) missingFields.push('brand');
    if (!price) missingFields.push('price');
    if (!totalStock) missingFields.push('totalStock');
    if (!images) missingFields.push('images');

    if (missingFields.length > 0) {
      return sendErrorResponse(res, 400, 'Missing required fields', {
        missingFields,
        message: `The following fields are required: ${missingFields.join(', ')}`
      });
    }

    // Parse images array with better error handling
    let parsedImages;
    try {
      parsedImages = JSON.parse(images);
      if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
        return sendErrorResponse(res, 400, 'At least one image is required', {
          field: 'images',
          received: parsedImages
        });
      }
    } catch (e) {
      return sendErrorResponse(res, 400, 'Invalid images format', {
        field: 'images',
        error: 'Images must be a valid JSON array',
        received: images
      });
    }

    // Handle department and category mapping for backward compatibility
    let productDepartment = department;
    let productPrimaryCategory = primaryCategory || category;

    // If no department is provided, try to map from legacy category
    if (!productDepartment && category) {
      const categoryMapping = {
        'men': 'men',
        'women': 'women',
        'kids': 'lifestyle',
        'accessories': 'lifestyle',
        'footwear': 'lifestyle',
        'electronics': 'electronics'
      };
      productDepartment = categoryMapping[category.toLowerCase()] || 'lifestyle';
    }

    // Default department if still not set
    if (!productDepartment) {
      productDepartment = 'lifestyle';
    }

    // Default primary category if not set
    if (!productPrimaryCategory) {
      productPrimaryCategory = category || 'general';
    }

    // Parse subCategories if provided
    let parsedSubCategories = [];
    if (subCategories) {
      try {
        parsedSubCategories = Array.isArray(subCategories) ? subCategories : JSON.parse(subCategories);
      } catch (e) {
        // If parsing fails, treat as empty array
        parsedSubCategories = [];
      }
    }

    // Validate numeric fields
    const numericPrice = Number(price);
    const numericSalePrice = salePrice ? Number(salePrice) : 0;
    const numericTotalStock = Number(totalStock);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return sendErrorResponse(res, 400, 'Invalid price', {
        field: 'price',
        message: 'Price must be a positive number',
        received: price
      });
    }

    if (salePrice && (isNaN(numericSalePrice) || numericSalePrice < 0)) {
      return sendErrorResponse(res, 400, 'Invalid sale price', {
        field: 'salePrice',
        message: 'Sale price must be a non-negative number',
        received: salePrice
      });
    }

    if (isNaN(numericTotalStock) || numericTotalStock < 0) {
      return sendErrorResponse(res, 400, 'Invalid total stock', {
        field: 'totalStock',
        message: 'Total stock must be a non-negative number',
        received: totalStock
      });
    }

    const newProduct = new Product({
      images: parsedImages,
      title,
      description,
      category: category || productPrimaryCategory, // Keep for backward compatibility
      department: productDepartment,
      primaryCategory: productPrimaryCategory,
      subCategories: parsedSubCategories,
      brand,
      price: numericPrice,
      salePrice: numericSalePrice,
      totalStock: numericTotalStock,
      averageReview: 0,
    });

    const savedProduct = await newProduct.save();

    return sendSuccessResponse(res, 201, 'Product created successfully', savedProduct);
  } catch (error) {
    return handleError(res, error, 'Error occurred while adding product');
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      department,
      primaryCategory,
      subCategories,
      brand,
      price,
      salePrice,
      totalStock,
      images,
    } = req.body;

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return sendNotFoundResponse(res, 'Product');
    }

    // Handle department and category mapping for backward compatibility
    let productDepartment = department || findProduct.department;
    let productPrimaryCategory = primaryCategory || category || findProduct.primaryCategory;

    // If no department is provided, try to map from legacy category
    if (!productDepartment && category) {
      const categoryMapping = {
        'men': 'men',
        'women': 'women',
        'kids': 'lifestyle',
        'accessories': 'lifestyle',
        'footwear': 'lifestyle',
        'electronics': 'electronics'
      };
      productDepartment = categoryMapping[category.toLowerCase()] || 'lifestyle';
    }

    // Default department if still not set
    if (!productDepartment) {
      productDepartment = 'lifestyle';
    }

    // Default primary category if not set
    if (!productPrimaryCategory) {
      productPrimaryCategory = category || 'general';
    }

    // Parse and validate new images if provided
    let parsedImages;
    if (images) {
      try {
        parsedImages = JSON.parse(images);
        if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
          return sendErrorResponse(res, 400, 'At least one image is required', {
            field: 'images',
            received: parsedImages
          });
        }
      } catch (e) {
        return sendErrorResponse(res, 400, 'Invalid images format', {
          field: 'images',
          error: 'Images must be a valid JSON array',
          received: images
        });
      }
    }

    // Parse subCategories if provided
    let parsedSubCategories = findProduct.subCategories || [];
    if (subCategories) {
      try {
        parsedSubCategories = Array.isArray(subCategories) ? subCategories : JSON.parse(subCategories);
      } catch (e) {
        // If parsing fails, keep existing subCategories
        parsedSubCategories = findProduct.subCategories || [];
      }
    }

    // Validate numeric fields if provided
    let numericPrice = findProduct.price;
    let numericSalePrice = findProduct.salePrice;
    let numericTotalStock = findProduct.totalStock;

    if (price !== undefined && price !== "") {
      numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return sendErrorResponse(res, 400, 'Invalid price', {
          field: 'price',
          message: 'Price must be a positive number',
          received: price
        });
      }
    }

    if (salePrice !== undefined && salePrice !== "") {
      numericSalePrice = Number(salePrice);
      if (isNaN(numericSalePrice) || numericSalePrice < 0) {
        return sendErrorResponse(res, 400, 'Invalid sale price', {
          field: 'salePrice',
          message: 'Sale price must be a non-negative number',
          received: salePrice
        });
      }
    }

    if (totalStock !== undefined && totalStock !== "") {
      numericTotalStock = Number(totalStock);
      if (isNaN(numericTotalStock) || numericTotalStock < 0) {
        return sendErrorResponse(res, 400, 'Invalid total stock', {
          field: 'totalStock',
          message: 'Total stock must be a non-negative number',
          received: totalStock
        });
      }
    }

    // If new images are provided, delete old ones from Cloudinary
    if (parsedImages && findProduct.images) {
      try {
        await Promise.all(findProduct.images.map(img => 
          cloudinary.uploader.destroy(img.public_id)
        ));
      } catch (error) {
        console.error("Error deleting old images:", error);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title: title || findProduct.title,
        description: description || findProduct.description,
        category: category || productPrimaryCategory || findProduct.category,
        department: productDepartment,
        primaryCategory: productPrimaryCategory,
        subCategories: parsedSubCategories,
        brand: brand || findProduct.brand,
        price: numericPrice,
        salePrice: numericSalePrice,
        totalStock: numericTotalStock,
        images: parsedImages || findProduct.images,
      },
      { new: true }
    );

    return sendSuccessResponse(res, 200, 'Product updated successfully', updatedProduct);
  } catch (error) {
    return handleError(res, error, 'Error occurred while updating product');
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return sendSuccessResponse(res, 200, 'Products fetched successfully', products);
  } catch (error) {
    return handleError(res, error, 'Error occurred while fetching products');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return sendNotFoundResponse(res, 'Product');
    }

    // Delete images from Cloudinary first
    if (product.images && product.images.length > 0) {
      try {
        await Promise.all(product.images.map(img => 
          cloudinary.uploader.destroy(img.public_id)
        ));
      } catch (error) {
        console.error("Error deleting product images:", error);
      }
    }

    await Product.findByIdAndDelete(id);

    return sendSuccessResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    return handleError(res, error, 'Error occurred while deleting product');
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Feature.findById(id);

    if (!banner) {
      return sendNotFoundResponse(res, 'Banner');
    }

    // Delete image from Cloudinary first
    if (banner.image) {
      try {
        // Extract public_id from the Cloudinary URL
        const urlParts = banner.image.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting banner image:", error);
      }
    }

    await Feature.findByIdAndDelete(id);

    return sendSuccessResponse(res, 200, 'Banner deleted successfully');
  } catch (error) {
    return handleError(res, error, 'Error occurred while deleting banner');
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  deleteBanner,
};
