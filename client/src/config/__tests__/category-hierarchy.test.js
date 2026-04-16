import { categoryHierarchy, categoryUtils, departmentKeywords, subCategoryKeywords } from '../category-hierarchy';

describe('Category Hierarchy Configuration', () => {
  describe('categoryHierarchy structure', () => {
    test('should have all required departments', () => {
      const expectedDepartments = ['men', 'women', 'electronics', 'lifestyle'];
      const actualDepartments = Object.keys(categoryHierarchy);
      
      expect(actualDepartments).toEqual(expect.arrayContaining(expectedDepartments));
      expect(actualDepartments).toHaveLength(expectedDepartments.length);
    });

    test('should have proper structure for each department', () => {
      Object.values(categoryHierarchy).forEach(department => {
        expect(department).toHaveProperty('id');
        expect(department).toHaveProperty('label');
        expect(department).toHaveProperty('primaryCategories');
        expect(typeof department.primaryCategories).toBe('object');
      });
    });

    test('should have sub-categories for each primary category', () => {
      Object.values(categoryHierarchy).forEach(department => {
        Object.values(department.primaryCategories).forEach(primaryCategory => {
          expect(primaryCategory).toHaveProperty('id');
          expect(primaryCategory).toHaveProperty('label');
          expect(primaryCategory).toHaveProperty('subCategories');
          expect(Array.isArray(primaryCategory.subCategories)).toBe(true);
          expect(primaryCategory.subCategories.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('categoryUtils.getDepartments', () => {
    test('should return all departments with id and label', () => {
      const departments = categoryUtils.getDepartments();
      
      expect(departments).toHaveLength(4);
      departments.forEach(dept => {
        expect(dept).toHaveProperty('id');
        expect(dept).toHaveProperty('label');
      });
      
      const departmentIds = departments.map(d => d.id);
      expect(departmentIds).toContain('men');
      expect(departmentIds).toContain('women');
      expect(departmentIds).toContain('electronics');
      expect(departmentIds).toContain('lifestyle');
    });
  });

  describe('categoryUtils.getPrimaryCategories', () => {
    test('should return primary categories for valid department', () => {
      const menCategories = categoryUtils.getPrimaryCategories('men');
      expect(menCategories).toHaveLength(1);
      expect(menCategories[0]).toEqual({
        id: 'apparel-accessories',
        label: 'Apparel & Accessories'
      });
    });

    test('should return empty array for invalid department', () => {
      const categories = categoryUtils.getPrimaryCategories('invalid');
      expect(categories).toEqual([]);
    });
  });

  describe('categoryUtils.getSubCategories', () => {
    test('should return sub-categories for valid department and primary category', () => {
      const subCategories = categoryUtils.getSubCategories('electronics', 'gadgets-hardware');
      
      expect(subCategories.length).toBeGreaterThan(0);
      expect(subCategories[0]).toHaveProperty('id');
      expect(subCategories[0]).toHaveProperty('label');
      
      const subCategoryIds = subCategories.map(s => s.id);
      expect(subCategoryIds).toContain('laptop');
      expect(subCategoryIds).toContain('desktop');
    });

    test('should return empty array for invalid parameters', () => {
      expect(categoryUtils.getSubCategories('invalid', 'invalid')).toEqual([]);
      expect(categoryUtils.getSubCategories('men', 'invalid')).toEqual([]);
    });
  });

  describe('categoryUtils.isValidCategoryPath', () => {
    test('should validate correct category paths', () => {
      expect(categoryUtils.isValidCategoryPath('men', 'apparel-accessories')).toBe(true);
      expect(categoryUtils.isValidCategoryPath('electronics', 'gadgets-hardware', 'laptop')).toBe(true);
    });

    test('should reject invalid category paths', () => {
      expect(categoryUtils.isValidCategoryPath('invalid', 'apparel-accessories')).toBe(false);
      expect(categoryUtils.isValidCategoryPath('men', 'invalid')).toBe(false);
      expect(categoryUtils.isValidCategoryPath('men', 'apparel-accessories', 'invalid')).toBe(false);
    });
  });

  describe('categoryUtils.getCategoryPathLabel', () => {
    test('should generate correct path labels', () => {
      expect(categoryUtils.getCategoryPathLabel('men', 'apparel-accessories'))
        .toBe("Men's > Apparel & Accessories");
      
      expect(categoryUtils.getCategoryPathLabel('electronics', 'gadgets-hardware', 'laptop'))
        .toBe("Electronics > Gadgets & Hardware > Laptop");
    });

    test('should handle invalid paths gracefully', () => {
      expect(categoryUtils.getCategoryPathLabel('invalid', 'invalid')).toBe('');
    });
  });

  describe('categoryUtils.searchCategories', () => {
    test('should find departments by keyword', () => {
      const results = categoryUtils.searchCategories('men');
      const departmentResults = results.filter(r => r.type === 'department');
      
      expect(departmentResults.length).toBeGreaterThan(0);
      expect(departmentResults[0]).toMatchObject({
        type: 'department',
        departmentId: 'men',
        label: "Men's"
      });
    });

    test('should find sub-categories by keyword', () => {
      const results = categoryUtils.searchCategories('laptop');
      const subCategoryResults = results.filter(r => r.type === 'subCategory');
      
      expect(subCategoryResults.length).toBeGreaterThan(0);
      expect(subCategoryResults[0]).toMatchObject({
        type: 'subCategory',
        departmentId: 'electronics',
        primaryCategoryId: 'gadgets-hardware',
        subCategoryId: 'laptop'
      });
    });

    test('should return empty array for non-matching keywords', () => {
      const results = categoryUtils.searchCategories('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('categoryUtils.getAllSubCategories', () => {
    test('should return all sub-categories with department context', () => {
      const allSubCategories = categoryUtils.getAllSubCategories();
      
      expect(allSubCategories.length).toBeGreaterThan(0);
      allSubCategories.forEach(subCat => {
        expect(subCat).toHaveProperty('id');
        expect(subCat).toHaveProperty('label');
        expect(subCat).toHaveProperty('departmentId');
        expect(subCat).toHaveProperty('primaryCategoryId');
        expect(subCat).toHaveProperty('departmentLabel');
        expect(subCat).toHaveProperty('primaryCategoryLabel');
      });
    });
  });

  describe('categoryUtils.mapLegacyCategory', () => {
    test('should map legacy categories correctly', () => {
      const menMapping = categoryUtils.mapLegacyCategory('men');
      expect(menMapping).toEqual({
        department: 'men',
        primaryCategory: 'apparel-accessories',
        subCategories: ['casual']
      });

      const womenMapping = categoryUtils.mapLegacyCategory('women');
      expect(womenMapping).toEqual({
        department: 'women',
        primaryCategory: 'apparel-beauty',
        subCategories: ['casual']
      });
    });

    test('should provide default mapping for unknown categories', () => {
      const unknownMapping = categoryUtils.mapLegacyCategory('unknown');
      expect(unknownMapping).toEqual({
        department: 'lifestyle',
        primaryCategory: 'accessories',
        subCategories: ['jewelry']
      });
    });
  });

  describe('Search Keywords', () => {
    test('should have keywords for all departments', () => {
      const departments = Object.keys(categoryHierarchy);
      departments.forEach(dept => {
        expect(departmentKeywords).toHaveProperty(dept);
        expect(Array.isArray(departmentKeywords[dept])).toBe(true);
        expect(departmentKeywords[dept].length).toBeGreaterThan(0);
      });
    });

    test('should have keywords for major sub-categories', () => {
      const majorSubCategories = ['laptop', 'desktop', 'formal', 'casual', 'sports'];
      majorSubCategories.forEach(subCat => {
        expect(subCategoryKeywords).toHaveProperty(subCat);
        expect(Array.isArray(subCategoryKeywords[subCat])).toBe(true);
      });
    });
  });
});