
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardNavigationGuide } from '@/components/Dashboard/Accessibility/KeyboardNavigationGuide';

describe('KeyboardNavigationGuide Component', () => {
  it('renders keyboard button correctly', () => {
    render(<KeyboardNavigationGuide />);
    
    // Check that the button is rendered with the correct label
    const button = screen.getByRole('button', { name: /keyboard shortcuts and accessibility information/i });
    expect(button).toBeInTheDocument();
    
    // Check that the keyboard icon exists
    const keyboardIcon = document.querySelector('[aria-hidden="true"]');
    expect(keyboardIcon).toBeInTheDocument();
  });

  it('opens popover when button is clicked', async () => {
    render(<KeyboardNavigationGuide />);
    
    // Initially, the popover content should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Click the button to open the popover
    const button = screen.getByRole('button', { name: /keyboard shortcuts and accessibility information/i });
    fireEvent.click(button);
    
    // Now the popover content should be visible
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    
    // Check for some expected content in the popover
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
    expect(screen.getByText(/tab/i)).toBeInTheDocument();
    expect(screen.getByText(/move to next focusable element/i)).toBeInTheDocument();
  });

  it('closes popover when close button is clicked', async () => {
    render(<KeyboardNavigationGuide />);
    
    // Open the popover
    const button = screen.getByRole('button', { name: /keyboard shortcuts and accessibility information/i });
    fireEvent.click(button);
    
    // Check it's open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Close the popover
    const closeButton = screen.getByRole('button', { name: /close keyboard shortcuts guide/i });
    fireEvent.click(closeButton);
    
    // Check it's closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
