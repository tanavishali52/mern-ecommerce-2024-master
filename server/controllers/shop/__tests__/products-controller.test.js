const { getFilteredProducts, getAvailableBrands, getFilterCounts, getProductDetails } = require('../products-controller');
const Product = require('../../../models/Product');

// Mock the Product model
jest.mock('../../../models/Product');

describe('Products Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getFilteredProducts', () => {
    const mockProducts = [
      {
        _id: '1',
        title: 'Test Product 1',
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: ['laptop'],
        brand: 'Apple',
        price: 1000,
        salePrice: 900
      },
      {
        _id: '2',
        title: 'Test Product 2',
        department: 'men',
        primaryCategory: 'apparel-accessories',
        subCategories: ['casual'],
        brand: 'Nike',
        price: 100,
        salePrice: 0
      }
    ];

    beforeEach(() => {
      Product.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockProducts)
          })
        })
      });
      Product.countDocuments = jest.fn().mockResolvedValue(2);
    });

    test('should filter products by department', async () => {
      req.query = { department: 'electronics' };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({ department: 'electronics' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        pagination: expect.any(Object)
      });
    });

    test('should filter products by hierarchical categories', async () => {
      req.query = {
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: 'laptop,tablet'
      };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: { $in: ['laptop', 'tablet'] }
      });
    });

    test('should filter products by hot offers', async () => {
      req.query = { hotOffers: 'true' };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        $expr: {
          $and: [
            { $gt: ["$salePrice", 0] },
            { $lt: ["$salePrice", "$price"] }
          ]
        }
      });
    });

    test('should filter products by price range', async () => {
      req.query = { minPrice: '100', maxPrice: '500' };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        price: { $gte: 100, $lte: 500 }
      });
    });

    test('should handle legacy category filter for backward compatibility', async () => {
      req.query = { category: 'men,women' };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        category: { $in: ['men', 'women'] }
      });
    });

    test('should handle legacy brand filter for backward compatibility', async () => {
      req.query = { brand: 'nike,adidas' };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        brand: { $in: ['nike', 'adidas'] }
      });
    });

    test('should apply correct sorting', async () => {
      req.query = { sortBy: 'price-hightolow' };

      await getFilteredProducts(req, res);

      expect(Product.find().sort).toHaveBeenCalledWith({ price: -1 });
    });

    test('should handle pagination correctly', async () => {
      req.query = { page: '2', limit: '10' };

      await getFilteredProducts(req, res);

      expect(Product.find().sort().skip).toHaveBeenCalledWith(10);
      expect(Product.find().sort().skip().limit).toHaveBeenCalledWith(10);
    });

    test('should handle attributes filter', async () => {
      req.query = { 
        attributes: JSON.stringify({
          color: ['red', 'blue'],
          size: ['M', 'L']
        })
      };

      await getFilteredProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({
        'attributes.color': { $in: ['red', 'blue'] },
        'attributes.size': { $in: ['M', 'L'] }
      });
    });

    test('should handle errors gracefully', async () => {
      Product.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await getFilteredProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Some error occurred while fetching products"
      });
    });
  });

  describe('getAvailableBrands', () => {
    const mockBrandAggregation = [
      { _id: 'Apple', count: 5 },
      { _id: 'Nike', count: 3 },
      { _id: 'Samsung', count: 7 }
    ];

    beforeEach(() => {
      Product.aggregate = jest.fn().mockResolvedValue(mockBrandAggregation);
    });

    test('should return available brands with counts', async () => {
      req.query = { department: 'electronics' };

      await getAvailableBrands(req, res);

      expect(Product.aggregate).toHaveBeenCalledWith([
        { $match: { department: 'electronics' } },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null, $ne: "" } } },
        { $sort: { _id: 1 } }
      ]);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { id: 'apple', label: 'Apple', count: 5 },
          { id: 'nike', label: 'Nike', count: 3 },
          { id: 'samsung', label: 'Samsung', count: 7 }
        ]
      });
    });

    test('should filter brands by category hierarchy', async () => {
      req.query = {
        department: 'electronics',
        primaryCategory: 'gadgets-hardware',
        subCategories: 'laptop'
      };

      await getAvailableBrands(req, res);

      expect(Product.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            department: 'electronics',
            primaryCategory: 'gadgets-hardware',
            subCategories: { $in: ['laptop'] }
          } 
        },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null, $ne: "" } } },
        { $sort: { _id: 1 } }
      ]);
    });

    test('should handle errors gracefully', async () => {
      Product.aggregate.mockRejectedValue(new Error('Database error'));

      await getAvailableBrands(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Some error occurred while fetching available brands"
      });
    });
  });

  describe('getFilterCounts', () => {
    beforeEach(() => {
      Product.aggregate = jest.fn()
        .mockResolvedValueOnce([
          { _id: 'electronics', count: 10 },
          { _id: 'men', count: 15 }
        ])
        .mockResolvedValueOnce([
          { _id: 'laptop', count: 5 },
          { _id: 'desktop', count: 3 }
        ])
        .mockResolvedValueOnce([
          { _id: 'Apple', count: 4 },
          { _id: 'Dell', count: 6 }
        ]);
      
      Product.countDocuments = jest.fn().mockResolvedValue(8);
    });

    test('should return filter counts for all categories', async () => {
      req.query = {
        department: 'electronics',
        primaryCategory: 'gadgets-hardware'
      };

      await getFilterCounts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          subCategories: {
            laptop: 5,
            desktop: 3
          },
          brands: {
            Apple: 4,
            Dell: 6
          },
          hotOffers: 8
        }
      });
    });

    test('should include department counts when no department selected', async () => {
      req.query = {};

      await getFilterCounts(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          departments: {
            electronics: 10,
            men: 15
          }
        })
      });
    });

    test('should handle errors gracefully', async () => {
      Product.aggregate.mockRejectedValue(new Error('Database error'));

      await getFilterCounts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Some error occurred while fetching filter counts"
      });
    });
  });

  describe('getProductDetails', () => {
    const mockProduct = {
      _id: '1',
      title: 'Test Product',
      department: 'electronics',
      brand: 'Apple'
    };

    test('should return product details for valid ID', async () => {
      req.params = { id: '1' };
      Product.findById = jest.fn().mockResolvedValue(mockProduct);

      await getProductDetails(req, res);

      expect(Product.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });

    test('should return 404 for non-existent product', async () => {
      req.params = { id: 'nonexistent' };
      Product.findById = jest.fn().mockResolvedValue(null);

      await getProductDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Product not found!"
      });
    });

    test('should handle errors gracefully', async () => {
      req.params = { id: '1' };
      Product.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await getProductDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Some error occurred while fetching product details"
      });
    });
  });
});