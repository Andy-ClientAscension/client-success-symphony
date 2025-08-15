import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SidebarNav } from '@/components/Layout/Sidebar/SidebarNav';
import { AllProviders } from '@/tests/setup/mock-providers';

// Mock navigation hooks
vi.mock('@/hooks/use-navigation-guard', () => ({
  useNavigationGuard: () => ({
    guardedNavigate: vi.fn().mockReturnValue(true),
    clearNavigationLock: vi.fn(),
    isNavigationLocked: () => false
  })
}));

describe('Accessibility - Interactive Elements', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Navigation Accessibility', () => {
    it('should use proper semantic HTML for navigation', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      // Check navigation container
      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();

      // Check that all navigation items are links, not buttons
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // Verify no nested interactive elements
      links.forEach(link => {
        const nestedButtons = link.querySelectorAll('button');
        expect(nestedButtons.length).toBe(0);
      });
    });

    it('should have proper ARIA attributes for navigation links', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const dashboardLink = screen.getByRole('link', { name: /navigate to dashboard/i });
      
      // Check ARIA attributes
      expect(dashboardLink).toHaveAttribute('aria-label', 'Navigate to Dashboard');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page'); // Assuming we're on dashboard
      
      // Check that icons are properly hidden from screen readers
      const icon = dashboardLink.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should prevent double-activation on rapid clicks', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const clientsLink = screen.getByRole('link', { name: /navigate to clients/i });
      
      // Rapid clicks
      await user.click(clientsLink);
      await user.click(clientsLink);
      await user.click(clientsLink);

      // Should only close sidebar once due to double-activation prevention
      expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard navigation', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const clientsLink = screen.getByRole('link', { name: /navigate to clients/i });
      
      // Focus the link
      clientsLink.focus();
      expect(clientsLink).toHaveFocus();

      // Press Enter
      fireEvent.keyDown(clientsLink, { key: 'Enter' });
      
      expect(mockCloseSidebar).toHaveBeenCalledTimes(1);

      // Press Space
      fireEvent.keyDown(clientsLink, { key: ' ' });
      
      // Should be protected by double-activation prevention
      expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
    });

    it('should have visible focus indicators', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        // Check that focus styles are applied
        const classes = link.className;
        expect(classes).toContain('focus:outline-none');
        expect(classes).toContain('focus:ring-2');
        expect(classes).toContain('focus:ring-primary');
      });
    });
  });

  describe('Interactive Element Standards', () => {
    it('should use buttons for actions and links for navigation', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      // All navigation items should be links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // Each link should have proper href attribute
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        const href = link.getAttribute('href');
        expect(href).toMatch(/^\//); // Should start with /
      });
    });

    it('should have discernible text content', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        // Each link should have accessible text
        const accessibleName = link.getAttribute('aria-label') || link.textContent;
        expect(accessibleName).toBeTruthy();
        expect(accessibleName!.length).toBeGreaterThan(0);
      });
    });

    it('should not have click handlers on non-interactive containers', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      // Check that no divs or spans have click handlers
      const container = screen.getByRole('navigation');
      const divs = container.querySelectorAll('div');
      const spans = container.querySelectorAll('span');

      [...divs, ...spans].forEach(element => {
        expect(element).not.toHaveAttribute('onclick');
        // These elements should not be focusable
        expect(element).not.toHaveAttribute('tabindex');
      });
    });
  });

  describe('Collapsed Navigation', () => {
    it('should maintain accessibility when collapsed', () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <AllProviders>
          <SidebarNav collapsed={true} closeSidebar={mockCloseSidebar} />
        </AllProviders>
      );

      const links = screen.getAllByRole('link');
      
      // Should still have proper ARIA labels even when text is hidden
      links.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
        const ariaLabel = link.getAttribute('aria-label');
        expect(ariaLabel).toContain('Navigate to');
      });
    });
  });
});