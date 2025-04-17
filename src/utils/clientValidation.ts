
import { Client } from '@/lib/data';

/**
 * Validates a client object and fixes any invalid properties
 * @param client The client object to validate
 * @returns A validated client object with fixed properties
 */
export const validateClient = (client: any): Client | null => {
  // Check if client exists and is an object
  if (!client || typeof client !== 'object') {
    console.warn('Invalid client data: Not an object', client);
    return null;
  }

  // Required fields validation
  if (!client.id || typeof client.id !== 'string') {
    console.warn('Invalid client data: Missing or invalid ID', client);
    return null;
  }

  if (!client.name || typeof client.name !== 'string') {
    console.warn('Invalid client data: Missing or invalid name', client);
    return null;
  }

  // Create a new client object with validated properties
  const validatedClient: Client = {
    ...client,
    id: client.id,
    name: client.name,
    startDate: client.startDate || new Date().toISOString().split('T')[0],
    endDate: client.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractValue: validateNumber(client.contractValue, 0),
    status: validateStatus(client.status),
    team: client.team || '',
    csm: client.csm || '',
    notes: client.notes || '',
    progress: validateNumber(client.progress, 0, 0, 100),
    npsScore: client.npsScore === undefined || client.npsScore === null ? null : validateNumber(client.npsScore, null, 0, 10),
    callsBooked: validateNumber(client.callsBooked, 0),
    dealsClosed: validateNumber(client.dealsClosed, 0),
    mrr: validateNumber(client.mrr, 0),
    backendStudents: validateNumber(client.backendStudents, 0),
    growth: validateNumber(client.growth, 0),
  };

  return validatedClient;
};

/**
 * Validates a collection of client objects
 * @param clients The array of client objects to validate
 * @returns An array of validated client objects with invalid entries removed
 */
export const validateClients = (clients: any[]): Client[] => {
  if (!Array.isArray(clients)) {
    console.warn('Invalid clients data: Not an array', clients);
    return [];
  }
  
  return clients
    .map(client => validateClient(client))
    .filter((client): client is Client => client !== null);
};

/**
 * Validates a numeric value and provides a fallback if invalid
 * @param value The value to validate
 * @param fallback The fallback value if invalid
 * @param min Optional minimum value
 * @param max Optional maximum value
 * @returns A validated number or fallback value
 */
const validateNumber = (value: any, fallback: number | null, min?: number, max?: number): number | null => {
  // If null fallback is allowed and value is null or undefined, return null
  if (fallback === null && (value === undefined || value === null)) {
    return null;
  }
  
  // Convert to number and check if valid
  const num = Number(value);
  
  if (isNaN(num)) {
    return fallback as number;
  }
  
  // Apply min/max constraints if provided
  if (min !== undefined && num < min) {
    return min;
  }
  
  if (max !== undefined && num > max) {
    return max;
  }
  
  return num;
};

/**
 * Validates a client status value
 * @param status The status value to validate
 * @returns A valid status value, defaulting to 'active' if invalid
 */
const validateStatus = (status: any): Client['status'] => {
  const validStatuses: Client['status'][] = [
    'active', 'at-risk', 'churned', 'new', 'paused', 'graduated', 'backend', 'olympia'
  ];
  
  if (typeof status !== 'string' || !validStatuses.includes(status as Client['status'])) {
    return 'active';
  }
  
  return status as Client['status'];
};
