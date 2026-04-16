import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import AnimatedBadge, { 
  withAnimatedBadge, 
  CartCounter, 
  WishlistCounter, 
  NotificationCounter 
} from '../animated-badge';

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('AnimatedBadge', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render with correct count', () => {
    render(<AnimatedBadge count={5} showZero={true} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not render when count is 0 and showZero is false', () => {
    const { container } = render(<AnimatedBadge count={0} showZero={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when count is 0 and showZero is true', () => {
    render(<AnimatedBadge count={0} showZero={true} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display 99+ when count exceeds maxDisplay', () => {
    render(<AnimatedBadge count={150} maxDisplay={99} showZero={true} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should display custom maxDisplay threshold', () => {
    render(<AnimatedBadge count={250} maxDisplay={200} showZero={true} />);
    expect(screen.getByText('200+')).toBeInTheDocument();
  });

  it('should apply correct position classes', () => {
    const { rerender } = render(<AnimatedBadge count={1} position="top-left" />);
    expect(screen.getByText('1')).toHaveClass('absolute -top-2 -left-2');

    rerender(<AnimatedBadge count={1} position="bottom-right" />);
    expect(screen.getByText('1')).toHaveClass('absolute -bottom-2 -right-2');
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<AnimatedBadge count={1} size="sm" />);
    expect(screen.getByText('1')).toHaveClass('h-4 w-4 text-xs');

    rerender(<AnimatedBadge count={1} size="lg" />);
    expect(screen.getByText('1')).toHaveClass('h-6 w-6 text-sm');
  });

  it('should apply correct color classes', () => {
    const { rerender } = render(<AnimatedBadge count={1} color="red" />);
    expect(screen.getByText('1')).toHaveClass('bg-red-500 text-white hover:bg-red-600');

    rerender(<AnimatedBadge count={1} color="blue" />);
    expect(screen.getByText('1')).toHaveClass('bg-blue-500 text-white hover:bg-blue-600');
  });

  it('should trigger animation when count changes', async () => {
    const { rerender } = render(<AnimatedBadge count={1} animationType="bounce" />);
    
    // Change count to trigger animation
    rerender(<AnimatedBadge count={2} animationType="bounce" />);
    
    // Check if animation class is applied
    expect(screen.getByText('1')).toHaveClass('animate-bounce');
    
    // Fast-forward timers to complete animation
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Count should update
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    // Animation should complete
    act(() => {
      jest.advanceTimersByTime(300);
    });
  });

  it('should apply different animation types', () => {
    const { rerender } = render(<AnimatedBadge count={1} animationType="scale" />);
    
    rerender(<AnimatedBadge count={2} animationType="scale" />);
    expect(screen.getByText('1')).toHaveClass('animate-pulse scale-110');
    
    rerender(<AnimatedBadge count={1} animationType="pulse" />);
    rerender(<AnimatedBadge count={3} animationType="pulse" />);
    expect(screen.getByText('1')).toHaveClass('animate-ping');
  });

  it('should apply custom className', () => {
    render(<AnimatedBadge count={1} className="custom-class" />);
    expect(screen.getByText('1')).toHaveClass('custom-class');
  });
});

describe('withAnimatedBadge HOC', () => {
  const TestComponent = ({ children, ...props }) => (
    <button {...props}>{children}</button>
  );

  const EnhancedComponent = withAnimatedBadge(TestComponent);

  it('should wrap component with badge', () => {
    render(
      <EnhancedComponent badgeProps={{ count: 5 }}>
        Test Button
      </EnhancedComponent>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not render badge when badgeProps is not provided', () => {
    render(<EnhancedComponent>Test Button</EnhancedComponent>);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should apply wrapper className', () => {
    const { container } = render(
      <EnhancedComponent 
        badgeProps={{ count: 1 }} 
        className="wrapper-class"
      >
        Test Button
      </EnhancedComponent>
    );
    
    expect(container.firstChild).toHaveClass('relative inline-block wrapper-class');
  });
});

describe('Specialized Counter Components', () => {
  describe('CartCounter', () => {
    it('should render with orange color and bounce animation', () => {
      render(<CartCounter count={3} />);
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('bg-orange-600 text-white hover:bg-orange-700');
    });

    it('should use bounce animation when count changes', () => {
      const { rerender } = render(<CartCounter count={1} />);
      rerender(<CartCounter count={2} />);
      expect(screen.getByText('1')).toHaveClass('animate-bounce');
    });
  });

  describe('WishlistCounter', () => {
    it('should render with red color and scale animation', () => {
      render(<WishlistCounter count={2} />);
      const badge = screen.getByText('2');
      expect(badge).toHaveClass('bg-red-500 text-white hover:bg-red-600');
    });

    it('should use scale animation when count changes', () => {
      const { rerender } = render(<WishlistCounter count={1} />);
      rerender(<WishlistCounter count={2} />);
      expect(screen.getByText('1')).toHaveClass('animate-pulse scale-110');
    });
  });

  describe('NotificationCounter', () => {
    it('should render with blue color, small size and pulse animation', () => {
      render(<NotificationCounter count={1} />);
      const badge = screen.getByText('1');
      expect(badge).toHaveClass('bg-blue-500 text-white hover:bg-blue-600');
      expect(badge).toHaveClass('h-4 w-4 text-xs');
    });

    it('should use pulse animation when count changes', () => {
      const { rerender } = render(<NotificationCounter count={1} />);
      rerender(<NotificationCounter count={2} />);
      expect(screen.getByText('1')).toHaveClass('animate-ping');
    });
  });
});

describe('Animation Timing', () => {
  it('should update count after delay', async () => {
    const { rerender } = render(<AnimatedBadge count={1} />);
    
    rerender(<AnimatedBadge count={5} />);
    
    // Initially should still show old count
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // After 50ms delay, should show new count
    act(() => {
      jest.advanceTimersByTime(60);
    });
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should reset animation state after 300ms', async () => {
    const { rerender } = render(<AnimatedBadge count={1} animationType="bounce" />);
    
    rerender(<AnimatedBadge count={2} animationType="bounce" />);
    
    // Should have animation class initially
    expect(screen.getByText('1')).toHaveClass('animate-bounce');
    
    // After animation completes
    act(() => {
      jest.advanceTimersByTime(350);
    });
    
    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).not.toHaveClass('animate-bounce');
    });
  });
});