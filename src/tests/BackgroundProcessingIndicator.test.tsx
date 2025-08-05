
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackgroundProcessingIndicator, BackgroundTaskStatus } from '@/components/Dashboard/BackgroundProcessingIndicator';

describe('BackgroundProcessingIndicator', () => {
  const mockTasks: BackgroundTaskStatus[] = [
    { id: '1', name: 'Task 1', status: 'running' },
    { id: '2', name: 'Task 2', status: 'error', message: 'Failed' },
    { id: '3', name: 'Task 3', status: 'success' }
  ];

  it('should render tasks correctly', () => {
    render(<BackgroundProcessingIndicator tasks={mockTasks} />);
    
    expect(screen.getByText('Background Tasks')).toBeInTheDocument();
    expect(screen.getByText('1 running')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<BackgroundProcessingIndicator tasks={mockTasks} onClick={handleClick} />);
    
    const badge = screen.getByRole('status');
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
    
    fireEvent.keyDown(badge, { key: ' ' });
    expect(handleClick).toHaveBeenCalled();
  });

  it('should show correct status for multiple running tasks', () => {
    const multipleRunning: BackgroundTaskStatus[] = [
      { id: '1', name: 'Task 1', status: 'running' },
      { id: '2', name: 'Task 2', status: 'running' }
    ];
    
    render(<BackgroundProcessingIndicator tasks={multipleRunning} />);
    expect(screen.getByText('2 running')).toBeInTheDocument();
  });

  it('should handle hover interactions correctly', async () => {
    render(<BackgroundProcessingIndicator tasks={mockTasks} />);
    
    const badge = screen.getByRole('status');
    fireEvent.mouseEnter(badge);
    
    // Wait for tooltip
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Task 1');
    expect(tooltip).toHaveTextContent('Task 2');
    expect(tooltip).toHaveTextContent('Task 3');
  });
});
