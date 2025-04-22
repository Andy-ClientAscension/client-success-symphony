
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '@/components/Dashboard/Accessibility/SkipLink';

describe('SkipLink Component', () => {
  it('renders with default label', () => {
    render(<SkipLink targetId="content" />);
    
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#content');
    expect(skipLink).toHaveClass('sr-only');
  });

  it('renders with custom label', () => {
    render(<SkipLink targetId="dashboard" label="Skip to dashboard" />);
    
    const skipLink = screen.getByText("Skip to dashboard");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#dashboard');
  });

  it('becomes visible on focus', async () => {
    const { container } = render(<SkipLink targetId="main" />);
    const skipLink = screen.getByText("Skip to main content");
    
    // Initially it should have sr-only class
    expect(skipLink).toHaveClass('sr-only');
    
    // When focused, it should have focus:not-sr-only class
    skipLink.focus();
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });
});
