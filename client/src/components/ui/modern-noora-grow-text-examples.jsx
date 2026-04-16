import React from 'react';
import ModernNooraGrowText from './modern-noora-grow-text';

/**
 * Usage Examples for ModernNooraGrowText Component
 * 
 * This file demonstrates various ways to use the component
 * across different contexts and with different styling options.
 */

const ModernNooraGrowTextExamples = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Modern NOORA GROW Text Examples
        </h1>

        {/* Size Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Size Variations</h2>
          <div className="space-y-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small (sm)</p>
              <ModernNooraGrowText variant="gradient" size="sm" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium (md) - Default</p>
              <ModernNooraGrowText variant="gradient" size="md" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large (lg)</p>
              <ModernNooraGrowText variant="gradient" size="lg" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Extra Large (xl)</p>
              <ModernNooraGrowText variant="gradient" size="xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Hero Size</p>
              <ModernNooraGrowText variant="gradient" size="hero" />
            </div>
          </div>
        </section>

        {/* Variant Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Style Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Gradient Variant</p>
              <ModernNooraGrowText variant="gradient" size="lg" />
            </div>
            <div className="p-6 bg-gray-900 rounded-lg shadow-sm">
              <p className="text-sm text-gray-400 mb-4">Neon Variant</p>
              <ModernNooraGrowText variant="neon" size="lg" />
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Animated Gradient</p>
              <ModernNooraGrowText variant="gradient" size="lg" animated={true} />
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Classic Variant</p>
              <ModernNooraGrowText variant="classic" size="lg" />
            </div>
          </div>
        </section>

        {/* Color Schemes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Color Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Primary</p>
              <ModernNooraGrowText variant="gradient" colorScheme="primary" size="lg" />
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Secondary</p>
              <ModernNooraGrowText variant="gradient" colorScheme="secondary" size="lg" />
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Accent</p>
              <ModernNooraGrowText variant="gradient" colorScheme="accent" size="lg" />
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-4">Hover to see effect</p>
              <ModernNooraGrowText 
                variant="gradient" 
                size="lg" 
                interactive={true}
                className="cursor-pointer"
              />
            </div>
            <div className="p-6 bg-gray-900 rounded-lg shadow-sm">
              <p className="text-sm text-gray-400 mb-4">Animated Neon</p>
              <ModernNooraGrowText 
                variant="neon" 
                size="lg" 
                animated={true}
                interactive={true}
              />
            </div>
          </div>
        </section>

        {/* Real-world Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Real-world Usage</h2>
          
          {/* Header Logo Example */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">As Header Logo</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <ModernNooraGrowText variant="gradient" size="md" interactive={true} />
              <div className="flex space-x-4">
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Home</button>
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Shop</button>
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">About</button>
              </div>
            </div>
          </div>

          {/* Hero Section Example */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-4">As Hero Title</h3>
            <div className="text-center py-12">
              <ModernNooraGrowText 
                variant="neon" 
                size="hero" 
                animated={true}
                colorScheme="accent"
              />
              <p className="mt-4 text-lg opacity-90">
                Modern youth fashion for the next generation
              </p>
              <button className="mt-6 px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>

          {/* Card Title Example */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <ModernNooraGrowText variant="classic" size="sm" colorScheme="primary" />
              <p className="mt-2 text-gray-600 text-sm">
                Premium quality products for modern lifestyle
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <ModernNooraGrowText variant="gradient" size="sm" colorScheme="secondary" />
              <p className="mt-2 text-gray-600 text-sm">
                Sustainable fashion choices for conscious consumers
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <ModernNooraGrowText variant="classic" size="sm" colorScheme="accent" />
              <p className="mt-2 text-gray-600 text-sm">
                Trendy designs that speak to your personality
              </p>
            </div>
          </div>
        </section>

        {/* Custom Text Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Custom Text Content</h2>
          <div className="space-y-4 text-center">
            <ModernNooraGrowText variant="gradient" size="lg">
              FASHION FORWARD
            </ModernNooraGrowText>
            <ModernNooraGrowText variant="neon" size="lg" colorScheme="secondary">
              STYLE REVOLUTION
            </ModernNooraGrowText>
            <ModernNooraGrowText variant="animated" size="lg" animated={true}>
              YOUTH CULTURE
            </ModernNooraGrowText>
          </div>
        </section>

        {/* Mobile Preview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mobile Preview</h2>
          <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-6 shadow-xl">
            <div className="bg-white rounded-2xl p-4 text-center">
              <ModernNooraGrowText variant="gradient" size="md" />
              <p className="mt-2 text-sm text-gray-600">Mobile optimized display</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModernNooraGrowTextExamples;