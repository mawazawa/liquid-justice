import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders with default props', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<Label data-testid="label">Label</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });

  it('merges custom className', () => {
    render(<Label className="custom-label" data-testid="label">Custom</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('custom-label');
    expect(label).toHaveClass('text-sm'); // default class
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <Label ref={ref as React.RefObject<HTMLLabelElement>}>
        Ref Test
      </Label>
    );
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('works with htmlFor attribute', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    );

    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('has peer-disabled styling', () => {
    render(<Label data-testid="label">Label</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
  });

  it('supports all label HTML attributes', () => {
    render(
      <Label
        data-testid="label"
        id="test-label"
        aria-label="Custom label"
      >
        Test
      </Label>
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('id', 'test-label');
    expect(label).toHaveAttribute('aria-label', 'Custom label');
  });

  it('renders as label element', () => {
    render(<Label>Label Element</Label>);
    const label = screen.getByText('Label Element');
    expect(label.tagName).toBe('LABEL');
  });
});
