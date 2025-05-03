
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Helper function to enable real-time updates for a table
 * @param tableName Table name to enable real-time for
 */
export async function enableRealtimeForTable(tableName: string): Promise<boolean> {
  try {
    // To enable real-time for a table, the SQL would be:
    // ALTER TABLE ${tableName} REPLICA IDENTITY FULL;
    // ALTER PUBLICATION supabase_realtime ADD TABLE ${tableName};
    
    // However, since we can't directly execute SQL here,
    // this is a placeholder for when the user wants to enable real-time
    // for a specific table. The user should run the SQL separately.
    
    console.log(`Please ensure table ${tableName} has real-time enabled with appropriate SQL commands`);
    return true;
  } catch (error) {
    console.error(`Failed to check real-time status for ${tableName}:`, error);
    return false;
  }
}

/**
 * Helper to optimize batch handling of real-time changes
 * @param changes Array of changes from real-time
 * @param currentData Current data array
 * @returns Updated data array with all changes applied
 */
export function applyBatchChanges<T extends { id: string }>(
  changes: RealtimePostgresChangesPayload<T>[],
  currentData: T[]
): T[] {
  // Start with current data
  let result = [...currentData];
  
  // Process all inserts
  const inserts = changes.filter(c => c.eventType === 'INSERT').map(c => c.new);
  if (inserts.length > 0) {
    // Add only items that don't already exist
    const existingIds = new Set(result.map(item => item.id));
    const newItems = inserts.filter(item => !existingIds.has(item.id));
    result = [...result, ...newItems];
  }
  
  // Process all updates
  const updates = changes.filter(c => c.eventType === 'UPDATE');
  if (updates.length > 0) {
    // Create a map of updates for quick lookup
    const updateMap = new Map(updates.map(u => [u.new.id, u.new]));
    
    // Apply all updates at once
    result = result.map(item => 
      updateMap.has(item.id) 
        ? { ...item, ...updateMap.get(item.id) } 
        : item
    );
  }
  
  // Process all deletes
  const deletes = changes.filter(c => c.eventType === 'DELETE').map(c => c.old.id);
  if (deletes.length > 0) {
    // Remove all deleted items at once
    const deleteSet = new Set(deletes);
    result = result.filter(item => !deleteSet.has(item.id));
  }
  
  return result;
}
