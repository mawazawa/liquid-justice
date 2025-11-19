import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes with clsx', () => {
    const result = cn('base', { conditional: true, skipped: false });
    expect(result).toBe('base conditional');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('merges Tailwind classes with twMerge', () => {
    // twMerge should resolve conflicting classes
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6'); // Later class wins
  });

  it('handles complex Tailwind class conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('p-4', 'text-center', 'bg-blue-500');
    expect(result).toContain('p-4');
    expect(result).toContain('text-center');
    expect(result).toContain('bg-blue-500');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles single class', () => {
    const result = cn('single');
    expect(result).toBe('single');
  });

  it('deduplicates identical classes', () => {
    const result = cn('same', 'same');
    // Should only have one instance
    expect(result).toBe('same');
  });

  it('handles complex component styling use case', () => {
    const baseStyles = 'flex items-center justify-center';
    const variantStyles = 'bg-blue-500 text-white';
    const customStyles = 'bg-red-500 rounded-lg'; // bg-red should override bg-blue

    const result = cn(baseStyles, variantStyles, customStyles);

    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-center');
    expect(result).toContain('text-white');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('bg-red-500');
    expect(result).not.toContain('bg-blue-500'); // Should be overridden
  });
});
