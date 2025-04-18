
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientsTable } from '@/components/Dashboard/ClientsTable';
import { Client } from '@/lib/data';

describe('ClientsTable', () => {
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Test Client 1',
      status: 'active',
      progress: 75,
      endDate: '2025-12-31',
      csm: 'John Doe',
      callsBooked: 5,
      dealsClosed: 3,
      mrr: 1000,
      npsScore: 8,
      startDate: '2023-01-01',
      contractValue: 50000,
      team: 'enterprise'
    },
    {
      id: '2',
      name: 'Test Client 2',
      status: 'at-risk',
      progress: 45,
      endDate: '2025-12-31',
      csm: 'Jane Smith',
      callsBooked: 3,
      dealsClosed: 1,
      mrr: 800,
      npsScore: 6,
      startDate: '2023-01-01',
      contractValue: 30000
    }
  ];

  const defaultProps = {
    clients: mockClients,
    selectedClientIds: [],
    onSelectClient: vi.fn(),
    onSelectAll: vi.fn(),
    onViewDetails: vi.fn(),
    onEditMetrics: vi.fn(),
    onUpdateNPS: vi.fn(),
  };

  it('renders the client table with correct headers', () => {
    render(<ClientsTable {...defaultProps} />);
    
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('displays correct client data', () => {
    render(<ClientsTable {...defaultProps} />);
    
    expect(screen.getByText('Test Client 1')).toBeInTheDocument();
    expect(screen.getByText('Test Client 2')).toBeInTheDocument();
  });

  it('handles client selection', () => {
    const onSelectClient = vi.fn();
    render(<ClientsTable {...defaultProps} onSelectClient={onSelectClient} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Click first client checkbox
    
    expect(onSelectClient).toHaveBeenCalledWith('1');
  });

  it('handles select all functionality', () => {
    const onSelectAll = vi.fn();
    render(<ClientsTable {...defaultProps} onSelectAll={onSelectAll} />);
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(onSelectAll).toHaveBeenCalled();
  });
});
