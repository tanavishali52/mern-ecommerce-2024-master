const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { 
      // Legacy filters (maintained for backward compatibility)
      category = [], 
      brand = [], 
      sortBy = "price-lowtohigh",
      
      // New hierarchical filters
      department,
      primaryCategory,
      subCategories = [],
      brands = [],
      
      // Additional filters
      hotOffers,
      minPrice,
      maxPrice,
      attributes,
      
      // Pagination
      page = 1,
      limit = 20
    } = req.query;

    let filters = {};

    // Handle legacy category filter (backward compatibility)
    if (category.length && !department) {
      filters.category = { $in: category.split(",") };
    }

    // Handle legacy brand filter (backward compatibility)
    if (brand.length && !brands.length) {
      filters.brand = { $in: brand.split(",") };
    }

    // New hierarchical filtering
    if (department) {
      filters.department = department;
    }

    if (primaryCategory) {
      filters.primaryCategory = primaryCategory;
    }

    if (subCategories.length) {
      const subCatArray = Array.isArray(subCategories) ? subCategories : subCategories.split(",");
      filters.subCategories = { $in: subCatArray };
    }

    if (brands.length) {
      const brandArray = Array.isArray(brands) ? brands : brands.split(",");
      filters.brand = { $in: brandArray };
    }

    // Hot offers filter
    if (hotOffers === 'true') {
      filters.$expr = {
        $and: [
          { $gt: ["$salePrice", 0] },
          { $lt: ["$salePrice", "$price"] }
        ]
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Attributes filter
    if (attributes) {
      try {
        const attributeFilters = JSON.parse(attributes);
        
        if (attributeFilters.color && attributeFilters.color.length) {
          filters['attributes.color'] = { $in: attributeFilters.color };
        }
        
        if (attributeFilters.size && attributeFilters.size.length) {
          filters['attributes.size'] = { $in: attributeFilters.size };
        }
        
        if (attributeFilters.material) {
          filters['attributes.material'] = attributeFilters.material;
        }
      } catch (error) {
        console.log('Error parsing attributes filter:', error);
      }
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.log('Error in getFilteredProducts:', error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching products",
    });
  }
};

// New endpoint for getting available brands based on current filters
const getAvailableBrands = async (req, res) => {
  try {
    const { 
      department,
      primaryCategory,
      subCategories = []
    } = req.query;

    let filters = {};

    if (department) {
      filters.department = department;
    }

    if (primaryCategory) {
      filters.primaryCategory = primaryCategory;
    }

    if (subCategories.length) {
      const subCatArray = Array.isArray(subCategories) ? subCategories : subCategories.split(",");
      filters.subCategories = { $in: subCatArray };
    }

    // Get unique brands with product counts
    const brandAggregation = await Product.aggregate([
      { $match: filters },
      { 
        $group: { 
          _id: "$brand", 
          count: { $sum: 1 } 
        } 
      },
      { 
        $match: { 
          _id: { $ne: null, $ne: "" } 
        } 
      },
      { 
        $sort: { 
          _id: 1 
        } 
      }
    ]);

    const brands = brandAggregation.map(item => ({
      id: item._id.toLowerCase().replace(/\s+/g, '-'),
      label: item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.log('Error in getAvailableBrands:', error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching available brands",
    });
  }
};

// New endpoint for getting filter counts
const getFilterCounts = async (req, res) => {
  try {
    const { 
      department,
      primaryCategory,
      subCategories = [],
      brands = [],
      hotOffers,
      minPrice,
      maxPrice
    } = req.query;

    // Base filters (excluding the filter we're counting)
    let baseFilters = {};

    if (department) {
      baseFilters.department = department;
    }

    if (primaryCategory) {
      baseFilters.primaryCategory = primaryCategory;
    }

    // Get counts for different filter options
    const counts = {};

    // Department counts (if no department selected)
    if (!department) {
      const departmentCounts = await Product.aggregate([
        { $match: baseFilters },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } }
      ]);
      counts.departments = departmentCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    }

    // Sub-category counts
    if (department && primaryCategory) {
      const subCategoryCounts = await Product.aggregate([
        { $match: { ...baseFilters, department, primaryCategory } },
        { $unwind: "$subCategories" },
        { $group: { _id: "$subCategories", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null } } }
      ]);
      counts.subCategories = subCategoryCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    }

    // Brand counts
    const brandFilters = { ...baseFilters };
    if (subCategories.length) {
      const subCatArray = Array.isArray(subCategories) ? subCategories : subCategories.split(",");
      brandFilters.subCategories = { $in: subCatArray };
    }

    const brandCounts = await Product.aggregate([
      { $match: brandFilters },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: "" } } }
    ]);
    counts.brands = brandCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Hot offers count
    const hotOffersCount = await Product.countDocuments({
      ...baseFilters,
      $expr: {
        $and: [
          { $gt: ["$salePrice", 0] },
          { $lt: ["$salePrice", "$price"] }
        ]
      }
    });
    counts.hotOffers = hotOffersCount;

    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.log('Error in getFilterCounts:', error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching filter counts",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log('Error in getProductDetails:', error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching product details",
    });
  }
};

module.exports = { 
  getFilteredProducts, 
  getProductDetails, 
  getAvailableBrands, 
  getFilterCounts 
};
