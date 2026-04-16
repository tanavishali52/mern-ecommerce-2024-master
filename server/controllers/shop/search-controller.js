const Product = require("../../models/Product");

// Enhanced search with fuzzy matching and live suggestions
const searchProducts = async (req, res) => {
  try {
    const { keyword, limit = 20, page = 1, suggestions = false } = req.query;
    
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    const searchTerm = keyword.trim();
    if (searchTerm.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search keyword cannot be empty",
      });
    }

    // For live suggestions, return limited results quickly
    if (suggestions === 'true') {
      return await getSearchSuggestions(req, res, searchTerm);
    }

    // Full search with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Create comprehensive search query
    const searchQuery = createEnhancedSearchQuery(searchTerm);
    
    // Execute search with pagination
    const searchResults = await Product.find(searchQuery)
      .sort({ 
        // Prioritize exact matches in title, then brand, then other fields
        title: 1,
        brand: 1,
        averageReview: -1 
      })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalResults = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalResults / limitNum);

    // Parse search terms for filter suggestions
    const filterSuggestions = parseSearchForFilters(searchTerm);

    res.status(200).json({
      success: true,
      data: searchResults,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      searchTerm,
      filterSuggestions
    });
  } catch (error) {
    console.log('Error in searchProducts:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while searching products",
    });
  }
};

// Get live search suggestions (fast, limited results)
const getSearchSuggestions = async (req, res, searchTerm) => {
  try {
    const regEx = new RegExp(searchTerm, "i");
    
    // Quick search for suggestions - prioritize title and brand matches
    const suggestions = await Product.find({
      $or: [
        { title: regEx },
        { brand: regEx },
        { searchKeywords: { $in: [regEx] } }
      ]
    })
    .select('title brand department primaryCategory images price salePrice')
    .limit(5)
    .sort({ title: 1 });

    // Also get brand and category suggestions
    const brandSuggestions = await Product.distinct('brand', { brand: regEx });
    const categorySuggestions = await Product.distinct('department', { department: regEx });

    res.status(200).json({
      success: true,
      data: {
        products: suggestions,
        brands: brandSuggestions.slice(0, 3),
        categories: categorySuggestions.slice(0, 3),
        searchTerm
      }
    });
  } catch (error) {
    console.log('Error in getSearchSuggestions:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching suggestions",
    });
  }
};

// Create enhanced search query with fuzzy matching
const createEnhancedSearchQuery = (searchTerm) => {
  const words = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
  const regExes = words.map(word => new RegExp(word, "i"));
  
  // Create multiple search strategies
  const searchConditions = [];
  
  // 1. Exact phrase match (highest priority)
  const exactRegEx = new RegExp(searchTerm, "i");
  searchConditions.push(
    { title: exactRegEx },
    { brand: exactRegEx },
    { description: exactRegEx }
  );
  
  // 2. All words must match (high priority)
  if (words.length > 1) {
    searchConditions.push({
      $and: regExes.map(regEx => ({
        $or: [
          { title: regEx },
          { brand: regEx },
          { description: regEx },
          { searchKeywords: regEx }
        ]
      }))
    });
  }
  
  // 3. Any word matches (medium priority)
  searchConditions.push({
    $or: [
      { title: { $in: regExes } },
      { brand: { $in: regExes } },
      { description: { $in: regExes } },
      { searchKeywords: { $in: regExes } },
      { category: { $in: regExes } }, // Legacy category support
      { department: { $in: regExes } },
      { primaryCategory: { $in: regExes } },
      { subCategories: { $in: regExes } }
    ]
  });
  
  return { $or: searchConditions };
};

// Parse search terms to suggest filters
const parseSearchForFilters = (searchTerm) => {
  const suggestions = {
    departments: [],
    categories: [],
    brands: [],
    attributes: {}
  };
  
  const words = searchTerm.toLowerCase().split(' ');
  
  // Department keywords
  const departmentKeywords = {
    men: ['men', "men's", 'male', 'gentleman', 'guy'],
    women: ['women', "women's", 'female', 'lady', 'girl'],
    electronics: ['electronics', 'tech', 'gadget', 'device', 'computer', 'phone'],
    lifestyle: ['lifestyle', 'accessories', 'jewelry', 'perfume']
  };
  
  // Check for department matches
  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      suggestions.departments.push(dept);
    }
  }
  
  // Sub-category keywords
  const subCategoryKeywords = {
    laptop: ['laptop', 'notebook', 'portable computer'],
    desktop: ['desktop', 'pc', 'computer', 'workstation'],
    camera: ['camera', 'photography', 'photo', 'dslr'],
    jacket: ['jacket', 'coat', 'blazer', 'outerwear'],
    formal: ['formal', 'dress', 'suit', 'business', 'office'],
    casual: ['casual', 'everyday', 'relaxed', 'comfortable'],
    sports: ['sports', 'athletic', 'gym', 'workout', 'fitness']
  };
  
  // Check for category matches
  for (const [category, keywords] of Object.entries(subCategoryKeywords)) {
    if (keywords.some(keyword => words.includes(keyword))) {
      suggestions.categories.push(category);
    }
  }
  
  // Color attributes
  const colorKeywords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
  const detectedColors = words.filter(word => colorKeywords.includes(word));
  if (detectedColors.length > 0) {
    suggestions.attributes.color = detectedColors;
  }
  
  return suggestions;
};

// Get popular search terms
const getPopularSearches = async (req, res) => {
  try {
    // This would typically come from search analytics
    // For now, return some common searches based on available products
    const popularBrands = await Product.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: "" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const popularCategories = await Product.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        brands: popularBrands.map(item => item._id),
        categories: popularCategories.map(item => item._id),
        trending: [
          'laptop', 'smartphone', 'headphones', 'jacket', 'sneakers'
        ]
      }
    });
  } catch (error) {
    console.log('Error in getPopularSearches:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching popular searches",
    });
  }
};

module.exports = { 
  searchProducts, 
  getSearchSuggestions,
  getPopularSearches 
};
