import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('is enabled by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows a spinner when isLoading is true', () => {
    const { container } = render(<Button isLoading>Saving</Button>);
    // The spinner is an animate-spin div
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('does not show a spinner when not loading', () => {
    const { container } = render(<Button>Save</Button>);
    expect(container.querySelector('.animate-spin')).toBeNull();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('does not apply w-full when fullWidth is false', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  it.each([
    ['primary', 'bg-red-700'],
    ['secondary', 'bg-gray-600'],
    ['outline', 'border'],
    ['ghost', 'text-gray-700'],
    ['danger', 'bg-red-600'],
  ] as const)('variant "%s" includes expected class "%s"', (variant, cls) => {
    render(<Button variant={variant}>Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it.each([
    ['sm', 'text-sm'],
    ['md', 'text-base'],
    ['lg', 'text-lg'],
  ] as const)('size "%s" includes expected class "%s"', (size, cls) => {
    render(<Button size={size}>Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(clicked).toBe(false);
  });

  it('merges extra className prop', () => {
    render(<Button className="custom-class">Btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
