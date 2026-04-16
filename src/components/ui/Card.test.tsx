import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies base styles', () => {
    const { container } = render(<Card>X</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200');
  });

  it('merges extra className', () => {
    const { container } = render(<Card className="p-4">X</Card>);
    expect((container.firstChild as HTMLElement)).toHaveClass('p-4');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('has bottom border', () => {
    const { container } = render(<CardHeader>H</CardHeader>);
    expect((container.firstChild as HTMLElement)).toHaveClass('border-b', 'border-gray-200');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body</CardBody>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('applies padding', () => {
    const { container } = render(<CardBody>B</CardBody>);
    expect((container.firstChild as HTMLElement)).toHaveClass('px-6', 'py-4');
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('has top border', () => {
    const { container } = render(<CardFooter>F</CardFooter>);
    expect((container.firstChild as HTMLElement)).toHaveClass('border-t', 'border-gray-200');
  });
});
