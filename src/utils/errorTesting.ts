
/**
 * Utility functions for testing error scenarios in development
 */

export const setupErrorTesting = () => {
  if (process.env.NODE_ENV === 'development') {
    // Simulated error triggers for testing
    (window as any).triggerError = {
      component: () => {
        throw new Error('Test component error');
      },
      async: async () => {
        throw new Error('Test async error');
      },
      network: () => {
        throw new Error('Test network error');
      },
      boundary: () => {
        throw new Error('Test error boundary');
      }
    };
    
    console.info(
      'Error testing utilities available in development mode:\n' +
      '- window.triggerError.component()\n' +
      '- window.triggerError.async()\n' +
      '- window.triggerError.network()\n' +
      '- window.triggerError.boundary()'
    );
  }
};

