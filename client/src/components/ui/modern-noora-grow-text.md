# ModernNooraGrowText Component

A modern, youth-oriented text styling component that provides multiple contemporary visual effects including gradients, neon glows, and smooth animations. Perfect for creating eye-catching brand text that appeals to young audiences.

## Features

- 🎨 **Multiple Style Variants**: Gradient, neon, animated, and classic styles
- 📱 **Fully Responsive**: Mobile-first design with fluid typography
- ♿ **Accessible**: WCAG compliant with screen reader support
- 🎭 **Interactive**: Hover effects and click interactions
- 🎯 **Customizable**: Flexible props for different use cases
- ⚡ **Performance Optimized**: GPU-accelerated animations
- 🎪 **Youth-Oriented**: Modern aesthetic that appeals to Gen Z

## Installation

The component is already integrated into the project. Simply import it:

```jsx
import ModernNooraGrowText from '@/components/ui/modern-noora-grow-text';
```

## Basic Usage

```jsx
// Default gradient style
<ModernNooraGrowText />

// Custom text content
<ModernNooraGrowText>YOUR BRAND</ModernNooraGrowText>

// Different variant
<ModernNooraGrowText variant="neon" size="lg" />
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'gradient' \| 'neon' \| 'animated' \| 'classic'` | `'gradient'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'hero'` | `'md'` | Text size |
| `colorScheme` | `'primary' \| 'secondary' \| 'accent'` | `'primary'` | Color scheme variant |
| `animated` | `boolean` | `false` | Enable continuous animations |
| `interactive` | `boolean` | `true` | Enable hover interactions |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | `'NOORA GROW'` | Text content |

## Style Variants

### Gradient Variant
Modern gradient text with smooth color transitions.

```jsx
<ModernNooraGrowText variant="gradient" colorScheme="primary" />
<ModernNooraGrowText variant="gradient" colorScheme="secondary" />
<ModernNooraGrowText variant="gradient" colorScheme="accent" />
```

**Features:**
- Smooth gradient backgrounds
- Hover effects with brightness changes
- Fallback for unsupported browsers
- Animated gradient option

### Neon Variant
Glowing neon effect perfect for dark backgrounds.

```jsx
<ModernNooraGrowText variant="neon" colorScheme="accent" />
<ModernNooraGrowText variant="neon" animated={true} />
```

**Features:**
- Multi-layer text shadows for glow effect
- Pulsing animation option
- Flicker effect on hover
- Color-specific glow matching

### Animated Variant
Continuous subtle animations for dynamic appeal.

```jsx
<ModernNooraGrowText variant="animated" size="hero" />
<ModernNooraGrowText variant="gradient" animated={true} />
```

**Features:**
- Floating text animation
- Gradient shifting effects
- Breathing scale animation
- Performance optimized

### Classic Variant
Clean, modern typography without effects.

```jsx
<ModernNooraGrowText variant="classic" colorScheme="primary" />
```

**Features:**
- Clean typography
- Subtle text shadows
- Smooth hover transitions
- Reliable fallback option

## Size System

The component uses a fluid typography system that scales responsively:

```jsx
<ModernNooraGrowText size="sm" />    {/* Small: 1rem - 1.125rem */}
<ModernNooraGrowText size="md" />    {/* Medium: 1.25rem - 1.5rem */}
<ModernNooraGrowText size="lg" />    {/* Large: 1.75rem - 2.25rem */}
<ModernNooraGrowText size="xl" />    {/* Extra Large: 2.25rem - 3rem */}
<ModernNooraGrowText size="hero" />  {/* Hero: 3rem - 4.5rem */}
```

## Color Schemes

Three predefined color schemes that integrate with your brand colors:

```jsx
<ModernNooraGrowText colorScheme="primary" />   {/* Blue tones */}
<ModernNooraGrowText colorScheme="secondary" /> {/* Green tones */}
<ModernNooraGrowText colorScheme="accent" />    {/* Purple/Pink tones */}
```

## Common Use Cases

### Header Logo
```jsx
<Link to="/home" className="header-logo">
  <ModernNooraGrowText 
    variant="gradient" 
    size="md" 
    interactive={true}
  />
</Link>
```

### Hero Section
```jsx
<div className="hero-section">
  <ModernNooraGrowText 
    variant="neon" 
    size="hero" 
    animated={true}
    colorScheme="accent"
  />
  <p>Your tagline here</p>
</div>
```

### Card Titles
```jsx
<div className="card">
  <ModernNooraGrowText 
    variant="classic" 
    size="sm" 
    colorScheme="primary"
  >
    FEATURED
  </ModernNooraGrowText>
  <p>Card content...</p>
</div>
```

### Mobile Navigation
```jsx
<div className="mobile-nav">
  <ModernNooraGrowText 
    variant="gradient" 
    size="sm"
    className="nav-brand"
  />
</div>
```

## Accessibility

The component follows WCAG guidelines:

- **Semantic HTML**: Uses proper `<span>` elements with `role="text"`
- **Screen Reader Support**: Maintains text content for assistive technologies
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **High Contrast**: Adapts to high contrast mode
- **Keyboard Navigation**: Works with keyboard interactions
- **Color Contrast**: Maintains sufficient contrast ratios

```jsx
<ModernNooraGrowText 
  aria-label="Brand name"
  role="text"
>
  NOORA GROW
</ModernNooraGrowText>
```

## Performance Considerations

### Optimizations Included
- **GPU Acceleration**: Uses CSS transforms for smooth animations
- **Will-Change**: Optimizes rendering for animated elements
- **Reduced Motion**: Disables animations when requested
- **Efficient Re-renders**: Minimizes unnecessary updates

### Best Practices
```jsx
// ✅ Good: Use animated sparingly
<ModernNooraGrowText variant="gradient" animated={false} />

// ✅ Good: Enable animations only when needed
<ModernNooraGrowText 
  variant="neon" 
  animated={isVisible && !prefersReducedMotion} 
/>

// ❌ Avoid: Too many animated elements
<div>
  <ModernNooraGrowText animated={true} />
  <ModernNooraGrowText animated={true} />
  <ModernNooraGrowText animated={true} />
</div>
```

## Browser Support

- **Modern Browsers**: Full feature support (Chrome, Firefox, Safari, Edge)
- **Gradient Support**: Graceful fallback to solid colors
- **Animation Support**: Respects user preferences
- **Mobile Browsers**: Optimized for touch devices

## Customization

### Custom Styling
```jsx
<ModernNooraGrowText 
  className="custom-brand-text"
  style={{ letterSpacing: '0.1em' }}
/>
```

### CSS Custom Properties
```css
.custom-brand-text {
  --noora-animation-duration: 5s;
  --noora-hover-duration: 0.5s;
}
```

### Extending Variants
```css
.modern-noora-text--custom {
  background: linear-gradient(45deg, #your-color-1, #your-color-2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Examples

Check out the comprehensive examples file:
```jsx
import ModernNooraGrowTextExamples from '@/components/ui/modern-noora-grow-text-examples';
```

## Troubleshooting

### Common Issues

**Gradient not showing:**
- Ensure browser supports `-webkit-background-clip: text`
- Check that fallback colors are defined
- Verify CSS custom properties are loaded

**Animations not working:**
- Check if user has `prefers-reduced-motion` enabled
- Ensure `animated` prop is set to `true`
- Verify CSS animations are not disabled globally

**Text not readable:**
- Check color contrast ratios
- Test with different background colors
- Consider using `classic` variant for better readability

**Performance issues:**
- Limit number of animated instances
- Use `will-change` sparingly
- Consider disabling animations on low-end devices

## Contributing

When extending this component:

1. **Maintain Accessibility**: Always test with screen readers
2. **Follow Naming**: Use BEM methodology for CSS classes
3. **Test Responsively**: Verify on mobile, tablet, and desktop
4. **Document Changes**: Update this README for new features
5. **Performance First**: Consider impact of new animations

## Related Components

- `Banner`: Hero section component
- `AnonHeader`: Main navigation header
- `ProductTile`: Product card components

## Version History

- **v1.0.0**: Initial release with gradient, neon, animated, and classic variants
- **v1.1.0**: Added comprehensive test suite and accessibility improvements
- **v1.2.0**: Enhanced mobile optimization and performance features