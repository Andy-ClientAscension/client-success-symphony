import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarNav } from '@/components/Layout/Sidebar/SidebarNav';
import { AllProviders } from '@/tests/setup/mock-providers';

// Mock the navigation guard hook
vi.mock('@/hooks/use-navigation-guard', () => ({
  useNavigationGuard: () => ({
    guardedNavigate: vi.fn().mockImplementation((path) => {
      console.log(`[MOCK] Navigating to: ${path}`);
      return true;
    }),
    clearNavigationLock: vi.fn(),
    isNavigationLocked: () => false
  })
}));

// Mock auth hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', email: 'test@example.com' },
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn()
  })
}));

// Test wrapper component using existing test infrastructure
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AllProviders authProps={{ authenticated: true, loading: false }}>
      {children}
    </AllProviders>
  );
};

describe('E2E Navigation Click Path Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Navigation on First Click - Core Flow Tests', () => {
    it('should navigate from Dashboard to Clients on first click', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      // Find and click the Clients navigation link
      const clientsLink = screen.getByRole('link', { name: /clients/i });
      expect(clientsLink).toBeInTheDocument();

      // Perform single click
      await user.click(clientsLink);

      // Verify navigation was attempted
      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });

      // Check that the link has the correct href
      expect(clientsLink).toHaveAttribute('href', '/clients');
    });

    it('should navigate from Dashboard to Analytics on first click', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      const analyticsLink = screen.getByRole('link', { name: /analytics/i });
      expect(analyticsLink).toBeInTheDocument();

      // Single click test
      await user.click(analyticsLink);

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });

      expect(analyticsLink).toHaveAttribute('href', '/analytics');
    });

    it('should navigate from Dashboard to Settings on first click', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toBeInTheDocument();

      // Single click test
      await user.click(settingsLink);

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });

      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('should navigate from Dashboard to Renewals on first click', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      const renewalsLink = screen.getByRole('link', { name: /renewals/i });
      expect(renewalsLink).toBeInTheDocument();

      // Single click test
      await user.click(renewalsLink);

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });

      expect(renewalsLink).toHaveAttribute('href', '/renewals');
    });
  });

  describe('Navigation Guard Functionality', () => {
    it('should prevent double-click navigation attempts', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      
      // Rapid double-click
      await user.click(dashboardLink);
      await user.click(dashboardLink);

      // Should only trigger once due to navigation guard
      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle navigation when sidebar is collapsed', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={true} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      const clientsLink = screen.getByRole('link', { name: /clients/i });
      
      // Should still work when collapsed
      await user.click(clientsLink);

      await waitFor(() => {
        expect(mockCloseSidebar).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility and DOM Assertions', () => {
    it('should have proper ARIA attributes for navigation', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      // Check that all navigation links have proper roles
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);

      // Check that buttons inside links have proper structure
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Each button should be inside a link
      buttons.forEach(button => {
        expect(button.closest('a')).toBeInTheDocument();
      });
    });

    it('should display correct icons for each navigation item', async () => {
      const mockCloseSidebar = vi.fn();
      
      render(
        <TestWrapper>
          <SidebarNav collapsed={false} closeSidebar={mockCloseSidebar} />
        </TestWrapper>
      );

      // Check that icons are present (they should have SVG elements)
      const icons = screen.getAllByRole('button').map(button => 
        button.querySelector('svg')
      ).filter(Boolean);
      
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});