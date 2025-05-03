
// ***********************************************
// Custom commands for Cypress Tests
// ***********************************************

// Authentication command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for login to complete by checking for dashboard element
  cy.contains('Dashboard', { timeout: 10000 }).should('exist');
});

// Accessibility testing command
Cypress.Commands.add('checkAccessibility', (context) => {
  cy.injectAxe();
  
  // Log the context being tested
  if (context) cy.log(`Checking accessibility: ${context}`);
  
  // Run accessibility tests
  cy.checkA11y(
    undefined,
    {
      includedImpacts: ['critical', 'serious']
    },
    (violations) => {
      cy.task('log', `${violations.length} accessibility violations were detected`);
      cy.task('log', violations);
    }
  );
});

// Offline mode check command
Cypress.Commands.add('checkOfflineMode', (shouldBeOffline) => {
  if (shouldBeOffline) {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      cy.stub(win, 'fetch').callsFake(() => Promise.reject(new Error('Network error')));
    });
    
    // Verify offline banner is shown
    cy.contains('You are offline').should('be.visible');
  } else {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
    });
    
    // Verify offline banner is not shown
    cy.contains('You are offline').should('not.exist');
  }
});

// Wait for data sync to complete
Cypress.Commands.add('waitForSync', () => {
  // Check for sync indicator to disappear or show completed status
  cy.get('[data-testid="sync-indicator"]', { timeout: 10000 })
    .should('not.have.class', 'syncing');
});
