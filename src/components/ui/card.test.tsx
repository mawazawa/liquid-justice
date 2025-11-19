import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card content');
  });

  it('renders with default styling', () => {
    render(<Card data-testid="card">Default Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
  });

  it('renders with refined styling', () => {
    render(<Card refined data-testid="card">Refined Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card-refined');
    expect(card).not.toHaveClass('shadow-sm');
  });

  it('renders with liquid glass styling', () => {
    render(<Card liquidGlass data-testid="card">Liquid Glass Card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('liquid-glass', 'rounded-2xl');
    expect(card).not.toHaveClass('shadow-sm');
  });

  it('prioritizes liquid glass over refined when both props are provided', () => {
    render(<Card liquidGlass refined data-testid="card">Priority Test</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('liquid-glass');
    expect(card).not.toHaveClass('card-refined');
  });

  it('merges custom className with default classes', () => {
    render(<Card className="custom-class" data-testid="card">Custom</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-lg'); // default class
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Card ref={ref as React.RefObject<HTMLDivElement>}>Ref Test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('supports all standard HTML div attributes', () => {
    render(
      <Card
        data-testid="card"
        id="test-card"
        role="region"
        aria-label="Test card"
      >
        Attributes Test
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'test-card');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });
});

describe('CardHeader', () => {
  it('renders with default props', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header content');
  });

  it('has proper spacing classes', () => {
    render(<CardHeader data-testid="card-header">Header</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('merges custom className', () => {
    render(<CardHeader className="custom-header" data-testid="card-header">Header</CardHeader>);
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('custom-header', 'p-6');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref as React.RefObject<HTMLDivElement>}>Ref Test</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('renders as h3 element', () => {
    render(<CardTitle>Test Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Title');
  });

  it('has proper typography classes', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  it('merges custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveClass('custom-title', 'text-2xl');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardTitle ref={ref as React.RefObject<HTMLParagraphElement>}>Ref Test</CardTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription', () => {
  it('renders as p element', () => {
    render(<CardDescription>Test description</CardDescription>);
    const description = screen.getByText('Test description');
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe('P');
  });

  it('has proper typography classes', () => {
    render(<CardDescription data-testid="description">Description</CardDescription>);
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('merges custom className', () => {
    render(<CardDescription className="custom-desc" data-testid="description">Desc</CardDescription>);
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('custom-desc', 'text-sm');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardDescription ref={ref as React.RefObject<HTMLParagraphElement>}>Ref Test</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent', () => {
  it('renders with default props', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Content');
  });

  it('has proper padding classes', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('merges custom className', () => {
    render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>);
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('custom-content', 'p-6');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardContent ref={ref as React.RefObject<HTMLDivElement>}>Ref Test</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('renders with default props', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Footer');
  });

  it('has proper layout classes', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('merges custom className', () => {
    render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>);
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('custom-footer', 'flex');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref as React.RefObject<HTMLDivElement>}>Ref Test</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card Composition', () => {
  it('renders complete card with all parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders card with only header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title Only</CardTitle>
        </CardHeader>
        <CardContent>Content Only</CardContent>
      </Card>
    );

    expect(screen.getByRole('heading', { name: /title only/i })).toBeInTheDocument();
    expect(screen.getByText('Content Only')).toBeInTheDocument();
  });
});
