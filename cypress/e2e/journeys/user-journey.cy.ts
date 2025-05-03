
describe('End-to-End User Journey', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete an entire user workflow', () => {
    // Step 1: Login
    cy.visit('/login');
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Step 2: Navigate to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
    
    // Step 3: Check metrics are loaded
    cy.get('[data-testid="dashboard-metrics"]').should('exist');
    cy.contains('Active').should('exist');
    
    // Step 4: Navigate to clients
    cy.contains('Clients').click();
    cy.url().should('include', '/clients');
    
    // Step 5: Filter clients
    cy.get('[data-testid="client-filter"]').click();
    cy.contains('Active').click();
    cy.get('[data-testid="apply-filters"]').click();
    
    // Step 6: Select a client
    cy.contains('tr', 'Client A').click();
    cy.url().should('include', '/clients/');
    
    // Step 7: Check client details
    cy.contains('Client Details').should('be.visible');
    cy.contains('Client A').should('be.visible');
    
    // Step 8: Update client
    cy.contains('button', 'Edit').click();
    cy.get('input[name="notes"]').clear().type('Updated notes for testing');
    cy.contains('button', 'Save').click();
    cy.contains('Client updated successfully').should('be.visible');
    
    // Step 9: Go back to dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    
    // Step 10: Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
