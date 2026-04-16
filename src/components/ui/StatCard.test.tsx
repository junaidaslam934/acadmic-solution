import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '@/components/ui/StatCard';

describe('StatCard', () => {
  const baseProps = {
    label: 'Total Students',
    value: 120,
    icon: <span data-testid="icon">👥</span>,
  };

  it('renders the label', () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText('Total Students')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<StatCard {...baseProps} value="98%" />);
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies default borderColor class', () => {
    const { container } = render(<StatCard {...baseProps} />);
    expect(container.firstChild).toHaveClass('border-red-700');
  });

  it('applies custom borderColor class', () => {
    const { container } = render(<StatCard {...baseProps} borderColor="border-blue-500" />);
    expect(container.firstChild).toHaveClass('border-blue-500');
  });

  it('applies gradient class when provided', () => {
    const { container } = render(
      <StatCard {...baseProps} gradient="bg-gradient-to-r from-red-500 to-red-700" />
    );
    expect(container.firstChild).toHaveClass('from-red-500');
  });

  it('uses bg-white when no gradient is provided', () => {
    const { container } = render(<StatCard {...baseProps} />);
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('renders upward trend correctly', () => {
    render(<StatCard {...baseProps} trend={{ direction: 'up', percent: 5 }} />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  it('renders downward trend correctly', () => {
    render(<StatCard {...baseProps} trend={{ direction: 'down', percent: 3 }} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
    expect(screen.getByText(/3%/)).toBeInTheDocument();
  });

  it('applies green text for upward trend', () => {
    render(<StatCard {...baseProps} trend={{ direction: 'up', percent: 5 }} />);
    expect(screen.getByText(/▲/)).toHaveClass('text-green-600');
  });

  it('applies red text for downward trend', () => {
    render(<StatCard {...baseProps} trend={{ direction: 'down', percent: 3 }} />);
    expect(screen.getByText(/▼/)).toHaveClass('text-red-600');
  });

  it('does not render trend section when trend is not provided', () => {
    const { container } = render(<StatCard {...baseProps} />);
    expect(container.querySelector('.text-green-600')).toBeNull();
    expect(container.querySelector('.text-red-600')).toBeNull();
  });
});
