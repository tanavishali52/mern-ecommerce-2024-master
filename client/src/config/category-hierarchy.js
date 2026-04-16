// Unified Category Hierarchy Configuration
export const categoryHierarchy = {
  men: {
    id: 'men',
    label: "Men's",
    primaryCategories: {
      "apparel-accessories": {
        id: "apparel-accessories",
        label: "Apparel & Accessories",
        subCategories: [
          { id: "formal", label: "Formal" },
          { id: "casual", label: "Casual" },
          { id: "sports", label: "Sports" },
          { id: "jacket", label: "Jacket" },
          { id: "sunglasses", label: "Sunglasses" }
        ]
      }
    }
  },
  women: {
    id: 'women',
    label: "Women's",
    primaryCategories: {
      "apparel-beauty": {
        id: "apparel-beauty",
        label: "Apparel & Beauty",
        subCategories: [
          { id: "formal", label: "Formal" },
          { id: "casual", label: "Casual" },
          { id: "perfume", label: "Perfume" },
          { id: "cosmetics", label: "Cosmetics" },
          { id: "bags", label: "Bags" }
        ]
      }
    }
  },
  electronics: {
    id: 'electronics',
    label: "Electronics",
    primaryCategories: {
      "gadgets-hardware": {
        id: "gadgets-hardware",
        label: "Gadgets & Hardware",
        subCategories: [
          { id: "desktop", label: "Desktop" },
          { id: "laptop", label: "Laptop" },
          { id: "camera", label: "Camera" },
          { id: "tablet", label: "Tablet" },
          { id: "headphone", label: "Headphone" },
          { id: "smart-watch", label: "Smart Watch" },
          { id: "smart-tv", label: "Smart TV" },
          { id: "keyboard", label: "Keyboard" },
          { id: "mouse", label: "Mouse" },
          { id: "microphone", label: "Microphone" }
        ]
      }
    }
  },
  lifestyle: {
    id: 'lifestyle',
    label: "Lifestyle",
    primaryCategories: {
      "accessories": {
        id: "accessories",
        label: "Accessories",
        subCategories: [
          { id: "jewelry", label: "Jewelry" },
          { id: "perfume", label: "Perfume" }
        ]
      }
    }
  }
};

// Utility functions for category navigation and validation
export const categoryUtils = {
  // Get all departments
  getDepartments() {
    return Object.values(categoryHierarchy).map(dept => ({
      id: dept.id,
      label: dept.label
    }));
  },

  // Get primary categories for a department
  getPrimaryCategories(departmentId) {
    const department = categoryHierarchy[departmentId];
    if (!department) return [];
    
    return Object.values(department.primaryCategories).map(cat => ({
      id: cat.id,
      label: cat.label
    }));
  },

  // Get sub-categories for a primary category
  getSubCategories(departmentId, primaryCategoryId) {
    const department = categoryHierarchy[departmentId];
    if (!department) return [];
    
    const primaryCategory = department.primaryCategories[primaryCategoryId];
    if (!primaryCategory) return [];
    
    return primaryCategory.subCategories || [];
  },

  // Validate category path
  isValidCategoryPath(departmentId, primaryCategoryId, subCategoryId = null) {
    const department = categoryHierarchy[departmentId];
    if (!department) return false;
    
    const primaryCategory = department.primaryCategories[primaryCategoryId];
    if (!primaryCategory) return false;
    
    if (subCategoryId) {
      return primaryCategory.subCategories.some(sub => sub.id === subCategoryId);
    }
    
    return true;
  },

  // Get full category path label
  getCategoryPathLabel(departmentId, primaryCategoryId, subCategoryId = null) {
    const department = categoryHierarchy[departmentId];
    if (!department) return '';
    
    const primaryCategory = department.primaryCategories[primaryCategoryId];
    if (!primaryCategory) return department.label;
    
    let path = `${department.label} > ${primaryCategory.label}`;
    
    if (subCategoryId) {
      const subCategory = primaryCategory.subCategories.find(sub => sub.id === subCategoryId);
      if (subCategory) {
        path += ` > ${subCategory.label}`;
      }
    }
    
    return path;
  },

  // Search for categories by keyword
  searchCategories(keyword) {
    const results = [];
    const searchTerm = keyword.toLowerCase();
    
    Object.values(categoryHierarchy).forEach(department => {
      // Check department name
      if (department.label.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'department',
          departmentId: department.id,
          label: department.label,
          path: department.label
        });
      }
      
      // Check primary categories
      Object.values(department.primaryCategories).forEach(primaryCategory => {
        if (primaryCategory.label.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'primaryCategory',
            departmentId: department.id,
            primaryCategoryId: primaryCategory.id,
            label: primaryCategory.label,
            path: `${department.label} > ${primaryCategory.label}`
          });
        }
        
        // Check sub-categories
        primaryCategory.subCategories.forEach(subCategory => {
          if (subCategory.label.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'subCategory',
              departmentId: department.id,
              primaryCategoryId: primaryCategory.id,
              subCategoryId: subCategory.id,
              label: subCategory.label,
              path: `${department.label} > ${primaryCategory.label} > ${subCategory.label}`
            });
          }
        });
      });
    });
    
    return results;
  },

  // Get all sub-categories as flat list for filtering
  getAllSubCategories() {
    const allSubCategories = [];
    
    Object.values(categoryHierarchy).forEach(department => {
      Object.values(department.primaryCategories).forEach(primaryCategory => {
        primaryCategory.subCategories.forEach(subCategory => {
          allSubCategories.push({
            ...subCategory,
            departmentId: department.id,
            primaryCategoryId: primaryCategory.id,
            departmentLabel: department.label,
            primaryCategoryLabel: primaryCategory.label
          });
        });
      });
    });
    
    return allSubCategories;
  },

  // Convert legacy category to new hierarchy
  mapLegacyCategory(legacyCategory) {
    const mappings = {
      'men': { department: 'men', primaryCategory: 'apparel-accessories', subCategories: ['casual'] },
      'women': { department: 'women', primaryCategory: 'apparel-beauty', subCategories: ['casual'] },
      'kids': { department: 'lifestyle', primaryCategory: 'accessories', subCategories: ['casual'] },
      'accessories': { department: 'lifestyle', primaryCategory: 'accessories', subCategories: ['jewelry'] },
      'footwear': { department: 'men', primaryCategory: 'apparel-accessories', subCategories: ['casual'] }
    };
    
    return mappings[legacyCategory?.toLowerCase()] || mappings['accessories'];
  }
};

// Department-specific search keywords for search integration
export const departmentKeywords = {
  men: ['men', "men's", 'male', 'gentleman', 'guy'],
  women: ['women', "women's", 'female', 'lady', 'girl'],
  electronics: ['electronics', 'tech', 'gadget', 'device', 'computer', 'phone'],
  lifestyle: ['lifestyle', 'accessories', 'jewelry', 'perfume']
};

// Sub-category search keywords
export const subCategoryKeywords = {
  // Men's & Women's
  formal: ['formal', 'dress', 'suit', 'business', 'office', 'professional'],
  casual: ['casual', 'everyday', 'relaxed', 'comfortable', 'informal'],
  sports: ['sports', 'athletic', 'gym', 'workout', 'fitness', 'active'],
  jacket: ['jacket', 'coat', 'blazer', 'outerwear'],
  sunglasses: ['sunglasses', 'shades', 'eyewear'],
  
  // Women's specific
  perfume: ['perfume', 'fragrance', 'scent', 'cologne'],
  cosmetics: ['cosmetics', 'makeup', 'beauty', 'lipstick', 'foundation'],
  bags: ['bag', 'handbag', 'purse', 'tote', 'clutch', 'backpack'],
  
  // Electronics
  desktop: ['desktop', 'pc', 'computer', 'workstation'],
  laptop: ['laptop', 'notebook', 'portable computer'],
  camera: ['camera', 'photography', 'photo', 'dslr'],
  tablet: ['tablet', 'ipad', 'tab'],
  headphone: ['headphone', 'headset', 'earphone', 'audio'],
  'smart-watch': ['smartwatch', 'smart watch', 'wearable', 'fitness tracker'],
  'smart-tv': ['smart tv', 'television', 'tv', 'monitor'],
  keyboard: ['keyboard', 'typing', 'mechanical'],
  mouse: ['mouse', 'pointer', 'click'],
  microphone: ['microphone', 'mic', 'recording', 'audio'],
  
  // Lifestyle
  jewelry: ['jewelry', 'jewellery', 'ring', 'necklace', 'bracelet', 'earring']
};

export default categoryHierarchy;