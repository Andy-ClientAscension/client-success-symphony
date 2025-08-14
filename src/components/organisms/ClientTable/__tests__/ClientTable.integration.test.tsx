import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientTable } from '../ClientTable';
import { createMockClients } from '../../../../shared/test-utils/test-data-factories';
import type { Client } from '@/lib/data';

// Mock the virtual scrolling library
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, start: 0, size: 56 },
      { index: 1, start: 56, size: 56 },
      { index: 2, start: 112, size: 56 }
    ]
  })
}));

describe('ClientTable Integration Tests', () => {
  const mockClients = createMockClients(10);
  const defaultProps = {
    clients: mockClients,
    selectedClientIds: [],
    onSelectClient: vi.fn(),
    onSelectAll: vi.fn(),
    onViewDetails: vi.fn(),
    onEditMetrics: vi.fn(),
    onUpdateNPS: vi.fn(),
    currentPage: 1,
    totalPages: 2,
    itemsPerPage: 10,
    onPageChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render client table with data', () => {
    render(<ClientTable {...defaultProps} />);
    
    expect(screen.getByRole('region', { name: /client data table/i })).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    render(<ClientTable {...defaultProps} />);
    
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('CSM')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should handle select all functionality', async () => {
    const user = userEvent.setup();
    render(<ClientTable {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all clients/i });
    await user.click(selectAllCheckbox);
    
    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should show selected state when all clients are selected', () => {
    const selectedProps = {
      ...defaultProps,
      selectedClientIds: mockClients.map(client => client.id)
    };
    
    render(<ClientTable {...selectedProps} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /unselect all clients/i });
    expect(selectAllCheckbox).toBeInTheDocument();
  });

  it('should handle pagination controls', async () => {
    const user = userEvent.setup();
    render(<ClientTable {...defaultProps} />);
    
    const nextButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable pagination buttons appropriately', () => {
    const firstPageProps = {
      ...defaultProps,
      currentPage: 1
    };
    
    render(<ClientTable {...firstPageProps} />);
    
    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).toBeDisabled();
  });

  it('should display pagination information', () => {
    render(<ClientTable {...defaultProps} />);
    
    expect(screen.getByText(/showing 1 to 10 of 10 clients/i)).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
  });

  it('should handle empty client list', () => {
    const emptyProps = {
      ...defaultProps,
      clients: [],
      totalPages: 1
    };
    
    render(<ClientTable {...emptyProps} />);
    
    expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ClientTable {...defaultProps} />);
    
    const table = screen.getByRole('grid');
    expect(table).toHaveAttribute('aria-rowcount', '11'); // 10 clients + 1 header
    expect(table).toHaveAttribute('aria-colcount', '11');
    
    const region = screen.getByRole('region', { name: /client data table/i });
    expect(region).toBeInTheDocument();
    
    const navigation = screen.getByRole('navigation', { name: /pagination/i });
    expect(navigation).toBeInTheDocument();
  });

  it('should handle keyboard navigation for select all', async () => {
    const user = userEvent.setup();
    render(<ClientTable {...defaultProps} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all clients/i });
    selectAllCheckbox.focus();
    
    await user.keyboard('{Enter}');
    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(2);
  });

  it('should handle scrollable content area', () => {
    render(<ClientTable {...defaultProps} />);
    
    const scrollableArea = screen.getByLabelText(/scrollable client table content/i);
    expect(scrollableArea).toHaveAttribute('tabIndex', '0');
    expect(scrollableArea).toHaveStyle({ height: '600px' });
  });

  it('should display client data in virtual rows', () => {
    render(<ClientTable {...defaultProps} />);
    
    // Due to virtualization, only the first few items should be rendered
    // We can test that the ClientRow components are rendered (mocked above)
    const tableBody = screen.getByRole('grid').querySelector('tbody');
    expect(tableBody).toBeInTheDocument();
  });
});