import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ShoppingProductTile from '../product-tile';

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }) => state,
  },
});

// Mock toast
jest.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const TestWrapper = ({ children }) => (
  <Provider store={mockStore}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('ShoppingProductTile Image Display', () => {
  const mockHandleGetProductDetails = jest.fn();

  const createMockProduct = (imageUrl, title = 'Test Product') => ({
    _id: '123',
    title,
    price: 100,
    salePrice: 0,
    totalStock: 10,
    category: 'electronics',
    brand: 'apple',
    images: [{ url: imageUrl }],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays image with object-contain styling', () => {
    const product = createMockProduct('https://example.com/square-image.jpg');
    
    render(
      <TestWrapper>
        <ShoppingProductTile
          product={product}
          handleGetProductDetails={mockHandleGetProductDetails}
        />
      </TestWrapper>
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveClass('object-contain');
    expect(image).toHaveClass('bg-gray-50');
  });

  test('maintains responsive height classes', () => {
    const product = createMockProduct('https://example.com/landscape-image.jpg');
    
    render(
      <TestWrapper>
        <ShoppingProductTile
          product={product}
          handleGetProductDetails={mockHandleGetProductDetails}
        />
      </TestWrapper>
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveClass('h-40');
    expect(image).toHaveClass('xs:h-44');
    expect(image).toHaveClass('sm:h-48');
    expect(image).toHaveClass('md:h-52');
    expect(image).toHaveClass('lg:h-56');
  });

  test('preserves transition and hover effects', () => {
    const product = createMockProduct('https://example.com/portrait-image.jpg');
    
    render(
      <TestWrapper>
        <ShoppingProductTile
          product={product}
          handleGetProductDetails={mockHandleGetProductDetails}
        />
      </TestWrapper>
    );

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveClass('transition-transform');
    expect(image).toHaveClass('duration-300');
    expect(image).toHaveClass('group-hover:scale-105');
  });

  test('handles fallback image with consistent styling', () => {
    const product = createMockProduct('', 'Product Without Image');
    
    render(
      <TestWrapper>
        <ShoppingProductTile
          product={product}
          handleGetProductDetails={mockHandleGetProductDetails}
        />
      </TestWrapper>
    );

    const image = screen.getByAltText('Product Without Image');
    expect(image.src).toContain('placeholder');
    expect(image).toHaveClass('object-contain');
    expect(image).toHaveClass('bg-gray-50');
  });

  test('displays multiple images with navigation', () => {
    const product = {
      ...createMockProduct('https://example.com/image1.jpg'),
      images: [
        { url: 'https://example.com/image1.jpg' },
        { url: 'https://example.com/image2.jpg' },
        { url: 'https://example.com/image3.jpg' },
      ],
    };
    
    render(
      <TestWrapper>
        <ShoppingProductTile
          product={product}
          handleGetProductDetails={mockHandleGetProductDetails}
        />
      </TestWrapper>
    );

    // Should show navigation buttons for multiple images
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Should show image indicators
    const indicators = screen.getAllByRole('button');
    const imageIndicators = indicators.filter(button => 
      button.className.includes('rounded-full') && 
      button.className.includes('w-2')
    );
    expect(imageIndicators).toHaveLength(3);
  });
});