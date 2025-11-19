import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-gradient-to-br', 'from-primary');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('from-secondary');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('from-destructive');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('text-foreground');
  });

  it('has proper base styling', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold'
    );
  });

  it('merges custom className', () => {
    render(<Badge className="custom-badge" data-testid="badge">Custom</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-badge');
    expect(badge).toHaveClass('inline-flex'); // default class
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Badge ref={ref as React.RefObject<HTMLDivElement>}>Ref Test</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('supports all HTML div attributes', () => {
    render(
      <Badge
        data-testid="badge"
        id="test-badge"
        role="status"
        aria-label="Status badge"
      >
        Test
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('id', 'test-badge');
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });

  it('has transition animations', () => {
    render(<Badge data-testid="badge">Animated</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('transition-all', 'duration-200');
  });

  it('has focus ring for accessibility', () => {
    render(<Badge data-testid="badge">Focusable</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('focus:ring-2', 'focus:ring-ring');
  });
});

describe('badgeVariants', () => {
  it('returns correct classes for default variant', () => {
    const classes = badgeVariants();
    expect(classes).toContain('from-primary');
  });

  it('returns correct classes for secondary variant', () => {
    const classes = badgeVariants({ variant: 'secondary' });
    expect(classes).toContain('from-secondary');
  });

  it('returns correct classes for destructive variant', () => {
    const classes = badgeVariants({ variant: 'destructive' });
    expect(classes).toContain('from-destructive');
  });

  it('returns correct classes for outline variant', () => {
    const classes = badgeVariants({ variant: 'outline' });
    expect(classes).toContain('text-foreground');
  });
});
