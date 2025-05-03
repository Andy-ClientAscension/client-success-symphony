
import React, { useState } from 'react';
import { useSmartLoading } from '@/hooks/useSmartLoading';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';

// This is a component that will be dynamically imported
// It represents a data table component for the dashboard
export const DataTable = ({ data = [], isLoading: externalLoading = false }: { data?: any[], isLoading?: boolean }) => {
  // Use smart loading behavior with high priority since this is a core UI component
  const { isLoading } = useSmartLoading(externalLoading, {
    priority: 2,
    minLoadingTime: 600,
    loadingDelay: 100
  });
  
  // If loading, show skeleton
  if (isLoading) {
    return <TableSkeleton rows={data.length || 5} columns={3} />;
  }
  
  return (
    <div className="data-table-container">
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">No data available</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.status}</td>
                <td>{item.value}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
