
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

  // Axe accessibility tests for each component
  describe('Automated accessibility checks', () => {
    it('MetricsCards has no accessibility violations', async () => {
      const { container } = render(<MetricsCards />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ClientsTable has no accessibility violations', async () => {
      const { container } = render(
        <ClientsTable
          clients={[]}
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
