const express = require("express");

const { 
  searchProducts, 
  getSearchSuggestions,
  getPopularSearches 
} = require("../../controllers/shop/search-controller");

const router = express.Router();

// Enhanced search endpoints
router.get("/", searchProducts); // Query-based search
router.get("/suggestions", getSearchSuggestions); // Live suggestions
router.get("/popular", getPopularSearches); // Popular searches
router.get("/:keyword", searchProducts); // Legacy support

module.exports = router;
