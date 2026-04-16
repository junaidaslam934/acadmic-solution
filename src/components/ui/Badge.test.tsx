import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('defaults to "default" variant styling', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label')).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it.each([
    ['success', 'bg-green-100', 'text-green-800'],
    ['warning', 'bg-yellow-100', 'text-yellow-800'],
    ['danger', 'bg-red-100', 'text-red-800'],
    ['info', 'bg-blue-100', 'text-blue-800'],
    ['default', 'bg-gray-100', 'text-gray-800'],
  ] as const)('variant "%s" applies correct bg and text classes', (variant, bg, text) => {
    render(<Badge variant={variant}>{variant}</Badge>);
    const badge = screen.getByText(variant);
    expect(badge).toHaveClass(bg);
    expect(badge).toHaveClass(text);
  });

  it('merges extra className', () => {
    render(<Badge className="mt-2">Tag</Badge>);
    expect(screen.getByText('Tag')).toHaveClass('mt-2');
  });

  it('renders as a <span> element', () => {
    render(<Badge>Span</Badge>);
    expect(screen.getByText('Span').tagName).toBe('SPAN');
  });
});
