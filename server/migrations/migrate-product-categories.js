const mongoose = require('mongoose');
const Product = require('../models/Product');

// Category mapping from legacy categories to new hierarchical structure
const categoryMappings = {
  // Men's categories
  'men': {
    department: 'men',
    primaryCategory: 'apparel-accessories',
    subCategories: ['casual']
  },
  'men-formal': {
    department: 'men',
    primaryCategory: 'apparel-accessories',
    subCategories: ['formal']
  },
  'men-casual': {
    department: 'men',
    primaryCategory: 'apparel-accessories',
    subCategories: ['casual']
  },
  'men-sports': {
    department: 'men',
    primaryCategory: 'apparel-accessories',
    subCategories: ['sports']
  },
  
  // Women's categories
  'women': {
    department: 'women',
    primaryCategory: 'apparel-beauty',
    subCategories: ['casual']
  },
  'women-formal': {
    department: 'women',
    primaryCategory: 'apparel-beauty',
    subCategories: ['formal']
  },
  'women-casual': {
    department: 'women',
    primaryCategory: 'apparel-beauty',
    subCategories: ['casual']
  },
  
  // Kids categories
  'kids': {
    department: 'lifestyle',
    primaryCategory: 'accessories',
    subCategories: ['casual']
  },
  
  // Accessories
  'accessories': {
    department: 'lifestyle',
    primaryCategory: 'accessories',
    subCategories: ['jewelry']
  },
  
  // Footwear
  'footwear': {
    department: 'men', // Default to men's, can be updated manually
    primaryCategory: 'apparel-accessories',
    subCategories: ['casual']
  },
  
  // Electronics (if any exist)
  'electronics': {
    department: 'electronics',
    primaryCategory: 'gadgets-hardware',
    subCategories: ['desktop']
  }
};

// Function to generate search keywords from product data
function generateSearchKeywords(product) {
  const keywords = [];
  
  // Add title words
  if (product.title) {
    keywords.push(...product.title.toLowerCase().split(' '));
  }
  
  // Add brand
  if (product.brand) {
    keywords.push(product.brand.toLowerCase());
  }
  
  // Add category information
  if (product.department) {
    keywords.push(product.department);
  }
  if (product.primaryCategory) {
    keywords.push(product.primaryCategory);
  }
  if (product.subCategories) {
    keywords.push(...product.subCategories);
  }
  
  // Add legacy category
  if (product.category) {
    keywords.push(product.category.toLowerCase());
  }
  
  // Remove duplicates and empty strings
  return [...new Set(keywords.filter(keyword => keyword && keyword.trim()))];
}

async function migrateProductCategories() {
  try {
    console.log('Starting product category migration...');
    
    // Get all products that need migration (missing department field)
    const productsToMigrate = await Product.find({
      $or: [
        { department: { $exists: false } },
        { primaryCategory: { $exists: false } }
      ]
    });
    
    console.log(`Found ${productsToMigrate.length} products to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const product of productsToMigrate) {
      try {
        const legacyCategory = product.category?.toLowerCase() || 'accessories';
        const mapping = categoryMappings[legacyCategory] || categoryMappings['accessories'];
        
        // Update product with new category structure
        const updateData = {
          department: mapping.department,
          primaryCategory: mapping.primaryCategory,
          subCategories: mapping.subCategories,
          searchKeywords: generateSearchKeywords({
            ...product.toObject(),
            department: mapping.department,
            primaryCategory: mapping.primaryCategory,
            subCategories: mapping.subCategories
          }),
          // Initialize attributes if not present
          attributes: product.attributes || {
            color: [],
            size: [],
            material: '',
            specifications: {}
          }
        };
        
        await Product.findByIdAndUpdate(product._id, updateData);
        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount} products...`);
        }
        
      } catch (error) {
        console.error(`Error migrating product ${product._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`Migration completed!`);
    console.log(`Successfully migrated: ${migratedCount} products`);
    console.log(`Errors: ${errorCount} products`);
    
    // Create indexes
    console.log('Creating database indexes...');
    await Product.collection.createIndex({ department: 1, primaryCategory: 1 });
    await Product.collection.createIndex({ department: 1, primaryCategory: 1, subCategories: 1 });
    await Product.collection.createIndex({ brand: 1, department: 1 });
    await Product.collection.createIndex({ isHotOffer: 1 });
    await Product.collection.createIndex({ searchKeywords: 1 });
    await Product.collection.createIndex({ price: 1, salePrice: 1 });
    console.log('Database indexes created successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { migrateProductCategories, generateSearchKeywords };

// Run migration if called directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
    return migrateProductCategories();
  }).then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}