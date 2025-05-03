
describe('Data Synchronization', () => {
  beforeEach(() => {
    // Login before each test
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    cy.login(testEmail, testPassword);
  });

  it('should sync data automatically when online', () => {
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Verify sync indicator shows completed state
    cy.waitForSync();
    
    // Verify data is loaded
    cy.get('[data-testid="dashboard-metrics"]').should('exist');
  });

  it('should show offline indicator when network is down', () => {
    // Go to dashboard
    cy.visit('/dashboard');
    
    // Simulate going offline
    cy.checkOfflineMode(true);
    
    // Check that offline indicator is visible
    cy.contains('You are offline').should('be.visible');
    
    // Simulate coming back online
    cy.checkOfflineMode(false);
    
    // Sync should restart
    cy.waitForSync();
  });

  it('should queue operations when offline and sync when back online', () => {
    // Go to clients page
    cy.visit('/clients');
    
    // Simulate going offline
    cy.checkOfflineMode(true);
    
    // Try to update a client (this should get queued)
    cy.contains('tr', 'Client A')
      .find('button[aria-label="Edit client"]')
      .click();
    
    // Make changes
    cy.get('input[name="name"]').clear().type('Client A Updated Offline');
    cy.contains('button', 'Save').click();
    
    // Should see indicator that it's saved locally
    cy.contains('Changes saved locally').should('be.visible');
    
    // Simulate coming back online
    cy.checkOfflineMode(false);
    
    // Wait for sync to complete
    cy.waitForSync();
    
    // Verify changes were synced
    cy.contains('Changes synced to server').should('be.visible');
    cy.contains('Client A Updated Offline').should('exist');
  });
});
