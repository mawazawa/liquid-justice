import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from './button';
import * as haptics from '@/lib/haptics';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });

    it('renders icon size', () => {
      render(<Button size="icon">Icon</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'w-11');
    });

    it('meets minimum touch target size (44x44px)', () => {
      render(<Button>Touch Target</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback on click when haptic prop is provided', async () => {
      const triggerHapticSpy = vi.spyOn(haptics, 'triggerHaptic');
      const user = userEvent.setup();

      render(<Button haptic="medium">Haptic Button</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(triggerHapticSpy).toHaveBeenCalledWith('medium');
      expect(triggerHapticSpy).toHaveBeenCalledTimes(1);
    });

    it('does not trigger haptic feedback when haptic prop is not provided', async () => {
      const triggerHapticSpy = vi.spyOn(haptics, 'triggerHaptic');
      const user = userEvent.setup();

      render(<Button>No Haptic</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(triggerHapticSpy).not.toHaveBeenCalled();
    });

    it('supports different haptic patterns', async () => {
      const triggerHapticSpy = vi.spyOn(haptics, 'triggerHaptic');
      const user = userEvent.setup();

      const { rerender } = render(<Button haptic="light">Light</Button>);
      await user.click(screen.getByRole('button'));
      expect(triggerHapticSpy).toHaveBeenCalledWith('light');

      rerender(<Button haptic="heavy">Heavy</Button>);
      await user.click(screen.getByRole('button'));
      expect(triggerHapticSpy).toHaveBeenCalledWith('heavy');

      rerender(<Button haptic="success">Success</Button>);
      await user.click(screen.getByRole('button'));
      expect(triggerHapticSpy).toHaveBeenCalledWith('success');
    });
  });

  describe('Click Handler', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick handler with event object', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });

    it('triggers haptic feedback before onClick handler', async () => {
      const order: string[] = [];
      const triggerHapticSpy = vi.spyOn(haptics, 'triggerHaptic').mockImplementation(() => {
        order.push('haptic');
      });
      const handleClick = vi.fn(() => {
        order.push('click');
      });
      const user = userEvent.setup();

      render(<Button haptic="medium" onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(order).toEqual(['haptic', 'click']);
    });
  });

  describe('Disabled State', () => {
    it('renders as disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports ARIA label', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has WCAG-compliant focus indicator', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-wcag-enhanced');
    });
  });

  describe('Custom ClassName', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // default class
    });
  });

  describe('AsChild Prop', () => {
    it('renders as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Button Variants Function', () => {
    it('returns correct classes for default variant and size', () => {
      const classes = buttonVariants();
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('h-11');
    });

    it('returns correct classes for custom variant', () => {
      const classes = buttonVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
    });

    it('returns correct classes for custom size', () => {
      const classes = buttonVariants({ size: 'lg' });
      expect(classes).toContain('h-12');
    });
  });
});
