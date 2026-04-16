import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from '@/components/ui/Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a label when label prop is provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('does not render a label when label prop is omitted', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('label')).toBeNull();
  });

  it('shows error text when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error border classes when error prop is set', () => {
    render(<Input error="bad" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('applies normal border class when no error', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveClass('border-gray-300');
  });

  it('renders leading icon when provided', () => {
    render(<Input leadingIcon={<span data-testid="icon">@</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('adds left padding when leading icon is present', () => {
    render(<Input leadingIcon={<span>@</span>} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-10');
  });

  it('does not add left padding when no leading icon', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveClass('px-4');
  });

  it('forwards placeholder prop', () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('uses label to derive id when no id is supplied', () => {
    render(<Input label="Roll Number" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'roll-number');
  });

  it('uses explicit id prop over derived id', () => {
    render(<Input label="Roll Number" id="custom-id" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  it('merges extra className', () => {
    render(<Input className="my-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('my-class');
  });
});
