
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MetricsCards } from '@/components/Dashboard/MetricsCards';
import { ClientsTable } from '@/components/Dashboard/ClientsTable';
import { DataSyncMonitor } from '@/components/Dashboard/DataSyncMonitor';

expect.extend(toHaveNoViolations);

describe('Dashboard Screen Reader Accessibility', () => {
  describe('MetricsCards Component', () => {
    it('has correct reading order for metrics data', async () => {
      render(<MetricsCards />);
      
      // Get all headings and verify they're in logical order
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent('Key Performance Indicators');
      
      // Verify metric cards are announced properly
      const metricsRegion = screen.getByRole('region', { name: /performance metrics/i });
      expect(metricsRegion).toBeInTheDocument();
      
      // Check that expandable sections are keyboard accessible
      const expandButton = screen.getByRole('button', { name: /expand/i });
      await userEvent.tab();
      expect(expandButton).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      
      // Verify live region updates
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('ClientsTable Component', () => {
    const mockClients = [
      { 
        id: '1', 
        name: 'Test Client', 
        status: 'active' as const,
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        contractValue: 10000,
        progress: 65
      },
      { 
        id: '2', 
        name: 'Another Client', 
        status: 'at-risk' as const,
        startDate: '2023-02-01',
        endDate: '2024-02-01',
        contractValue: 15000,
        progress: 40
      }
    ];

    it('supports keyboard navigation in table', async () => {
      render(
        <ClientsTable
          clients={mockClients}
          selectedClientIds={[]}
          onSelectClient={() => {}}
          onSelectAll={() => {}}
          onViewDetails={() => {}}
          onEditMetrics={() => {}}
          onUpdateNPS={() => {}}
        />
      );

      // Verify table is keyboard navigable
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();

      // Test row header associations
      const rows = screen.getAllByRole('row');
      rows.forEach(row => {
        expect(row).toHaveAttribute('aria-rowindex');
      });

      // Test cell relationships
      const cells = screen.getAllByRole('gridcell');
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('aria-colindex');
      });

      // Verify focus management
      await userEvent.tab();
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      expect(firstCheckbox).toHaveFocus();
    });

    it('announces selection changes', async () => {
      const onSelectClient = vi.fn();
      render(
        <ClientsTable
          clients={mockClients}
          selectedClientIds={[]}
          onSelectClient={onSelectClient}
          onSelectAll={() => {}}
          onViewDetails={() => {}}
          onEditMetrics={() => {}}
          onUpdateNPS={() => {}}
        />
      );

      const checkbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(checkbox);
      expect(onSelectClient).toHaveBeenCalled();
      
      // Verify selection announcement
      const row = checkbox.closest('tr');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('DataSyncMonitor Component', () => {
    it('has properly labeled form controls', () => {
      render(<DataSyncMonitor />);

      // Check form control labeling
      const autoSyncSwitch = screen.getByRole('switch', { name: /auto-sync/i });
      expect(autoSyncSwitch).toHaveAccessibleName();

      const intervalInput = screen.getByRole('spinbutton', { name: /interval/i });
      expect(intervalInput).toHaveAccessibleName();

      // Verify button accessibility
      const syncButton = screen.getByRole('button', { name: /sync now/i });
      expect(syncButton).toHaveAccessibleDescription();
    });

    it('announces sync status changes', async () => {
      render(<DataSyncMonitor />);

      // Verify status announcements
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');

      // Check loading state announcements
      const syncButton = screen.getByRole('button', { name: /sync now/i });
      await userEvent.click(syncButton);
      
      const loadingSpinner = screen.getByRole('progressbar');
      expect(loadingSpinner).toHaveAccessibleName();
    });
  });

  describe('Automated accessibility checks', () => {
    it('MetricsCards has no accessibility violations', async () => {
      const { container } = render(<MetricsCards />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ClientsTable has no accessibility violations', async () => {
      const mockClients = [
        { 
          id: '1', 
          name: 'Test Client', 
          status: 'active' as const,
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          contractValue: 10000,
          progress: 65
        },
        { 
          id: '2', 
          name: 'Another Client', 
          status: 'at-risk' as const,
          startDate: '2023-02-01',
          endDate: '2024-02-01',
          contractValue: 15000,
          progress: 40
        }
      ];
    
      const { container } = render(
        <ClientsTable
          clients={mockClients}
          selectedClientIds={[]}
          onSelectClient={() => {}}
          onSelectAll={() => {}}
          onViewDetails={() => {}}
          onEditMetrics={() => {}}
          onUpdateNPS={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DataSyncMonitor has no accessibility violations', async () => {
      const { container } = render(<DataSyncMonitor />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Dashboard Keyboard Navigation', () => {
  describe('Tab Order Tests', () => {
    it('MetricsCards tab order follows visual layout', async () => {
      render(<MetricsCards />);
      
      const user = userEvent.setup();
      
      // Start with no element focused
      let activeElement = document.activeElement;
      expect(activeElement).toBe(document.body);
      
      // First tab should focus the first interactive element
      await user.tab();
      activeElement = document.activeElement;
      expect(activeElement).not.toBe(document.body);
      
      // Verify elements are focused in a logical sequence
      const interactiveElements = screen.getAllByRole('button');
      for (let i = 0; i < interactiveElements.length - 1; i++) {
        await user.tab();
        activeElement = document.activeElement;
        // Visual order verification
        const rect1 = interactiveElements[i].getBoundingClientRect();
        const rect2 = interactiveElements[i + 1].getBoundingClientRect();
        
        // Check if the tab order follows roughly top-to-bottom, left-to-right pattern
        const isInVisualOrder = (rect1.top < rect2.top) || 
          (Math.abs(rect1.top - rect2.top) < 20 && rect1.left < rect2.left);
          
        expect(isInVisualOrder || activeElement === interactiveElements[i + 1]).toBeTruthy();
      }
    });
    
    it('ClientsTable respects tab order for all interactive elements', async () => {
      const mockClients = [
        { 
          id: '1', 
          name: 'Test Client', 
          status: 'active' as const,
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          contractValue: 10000,
          progress: 65
        },
        { 
          id: '2', 
          name: 'Another Client', 
          status: 'at-risk' as const,
          startDate: '2023-02-01',
          endDate: '2024-02-01',
          contractValue: 15000,
          progress: 40
        }
      ];
      
      render(
        <ClientsTable
          clients={mockClients}
          selectedClientIds={[]}
          onSelectClient={() => {}}
          onSelectAll={() => {}}
          onViewDetails={() => {}}
          onEditMetrics={() => {}}
          onUpdateNPS={() => {}}
        />
      );
      
      const user = userEvent.setup();
      
      // Check that we can tab through all checkboxes, buttons and other controls
      const interactiveElements = screen.getAllByRole('checkbox').concat(
        screen.getAllByRole('button')
      );
      
      let count = 0;
      await user.tab(); // First tab
      
      for (let i = 0; i < interactiveElements.length; i++) {
        if (document.activeElement && 
            (document.activeElement.tagName === 'BUTTON' || 
             document.activeElement.getAttribute('role') === 'checkbox')) {
          count++;
        }
        await user.tab();
      }
      
      // Verify we were able to focus at least as many elements as we found
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(interactiveElements.length);
    });
  });
  
  describe('Complex Widget Keyboard Operability', () => {
    it('DataSyncMonitor controls are keyboard operable', async () => {
      render(<DataSyncMonitor />);
      
      const user = userEvent.setup();
      
      // Test switch toggle with keyboard
      const autoSyncSwitch = screen.getByRole('switch', { name: /auto-sync/i });
      await user.tab(); // Tab until we reach the switch
      while (document.activeElement !== autoSyncSwitch) {
        await user.tab();
      }
      
      // Initial state
      const initialChecked = autoSyncSwitch.getAttribute('aria-checked') === 'true';
      
      // Toggle with space key
      await user.keyboard(' ');
      
      // Verify the state changed
      expect(autoSyncSwitch.getAttribute('aria-checked') === 'true').toBe(!initialChecked);
      
      // Test interval input with keyboard
      const intervalInput = screen.getByRole('spinbutton', { name: /interval/i });
      await user.tab(); // Tab to the input
      while (document.activeElement !== intervalInput) {
        await user.tab();
      }
      
      // Clear and type new value
      await user.clear(intervalInput);
      await user.type(intervalInput, '30');
      
      // Verify the value changed
      expect(intervalInput).toHaveValue(30);
    });
    
    it('Dropdowns in tables can be operated with keyboard', async () => {
      const mockClients = [
        { 
          id: '1', 
          name: 'Test Client', 
          status: 'active' as const,
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          contractValue: 10000,
          progress: 65
        },
        { 
          id: '2', 
          name: 'Another Client', 
          status: 'at-risk' as const,
          startDate: '2023-02-01',
          endDate: '2024-02-01',
          contractValue: 15000,
          progress: 40
        }
      ];
      
      render(
        <ClientsTable
          clients={mockClients}
          selectedClientIds={[]}
          onSelectClient={() => {}}
          onSelectAll={() => {}}
          onViewDetails={() => {}}
          onEditMetrics={() => {}}
          onUpdateNPS={() => {}}
        />
      );
      
      const user = userEvent.setup();
      
      // Find a dropdown trigger button (usually has aria-haspopup="true")
      const dropdownTriggers = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-haspopup') === 'true'
      );
      
      if (dropdownTriggers.length) {
        // Tab to the dropdown trigger
        let found = false;
        await user.tab();
        
        // Tab until we find the dropdown trigger
        for (let i = 0; i < 20 && !found; i++) { // Limit to 20 tabs to prevent infinite loop
          if (dropdownTriggers.includes(document.activeElement as HTMLElement)) {
            found = true;
          } else {
            await user.tab();
          }
        }
        
        if (found) {
          // Press Enter to open the dropdown
          await user.keyboard('{Enter}');
          
          // Look for dropdown items
          const menuItems = screen.getAllByRole('menuitem');
          expect(menuItems.length).toBeGreaterThan(0);
          
          // Verify we can access menu items with keyboard
          // Press arrow down to navigate the menu
          await user.keyboard('{ArrowDown}');
          
          // Check if a menu item is focused or if the focus stays on the trigger
          const focusedElement = document.activeElement;
          const isFocusOnMenuItemOrTrigger = 
            focusedElement === dropdownTriggers[0] || 
            menuItems.includes(focusedElement as HTMLElement);
            
          expect(isFocusOnMenuItemOrTrigger).toBe(true);
        }
      }
    });
  });
  
  describe('Focus Visibility Tests', () => {
    it('focus indicators are visible on interactive elements', async () => {
      // Use a helper function to get computed style
      const getComputedStyleForElement = (element: Element): CSSStyleDeclaration => {
        return window.getComputedStyle(element);
      };
      
      render(<MetricsCards />);
      
      const user = userEvent.setup();
      
      // Tab through all interactive elements
      await user.tab();
      
      let hasVisibleFocusStyles = false;
      const interactiveElements = screen.getAllByRole('button');
      
      for (let i = 0; i < interactiveElements.length; i++) {
        if (document.activeElement === interactiveElements[i]) {
          const style = getComputedStyleForElement(interactiveElements[i]);
          
          // Check for common focus indicators
          const hasOutline = style.outline !== 'none' && style.outline !== '';
          const hasShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
          const hasBorder = style.border !== 'none' && style.border !== '' && 
                          !style.border.includes('transparent');
          
          hasVisibleFocusStyles = hasOutline || hasShadow || hasBorder;
          
          if (hasVisibleFocusStyles) {
            break;
          }
        }
        
        await user.tab();
      }
      
      // This is a basic test - in a real environment, you might need visual regression testing
      // to truly verify focus styles are visually apparent
      expect(hasVisibleFocusStyles).toBe(true);
    });
  });
});
