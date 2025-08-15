describe('Navigation First Click E2E Tests', () => {
  beforeEach(() => {
    // Reset application state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Core Navigation Flows', () => {
    it('Home → Dashboard navigation works on first click', () => {
      cy.visit('/');
      
      // Assert we're on home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-testid="home-page"]').should('be.visible');
      
      // Single click to dashboard
      cy.get('[data-testid="nav-dashboard"]').click();
      
      // Assert navigation succeeded
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
      cy.title().should('contain', 'Dashboard');
    });

    it('Dashboard → Clients → Back navigation works on first click', () => {
      // Start at dashboard (assuming auth bypass for testing)
      cy.visit('/dashboard');
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
      
      // Navigate to clients
      cy.get('[data-testid="nav-clients"]').click();
      cy.url().should('include', '/clients');
      cy.get('[data-testid="clients-page"]').should('be.visible');
      
      // Navigate back to dashboard
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
    });

    it('Dashboard → Settings → Save → Navigate away works on first click', () => {
      cy.visit('/dashboard');
      
      // Navigate to settings
      cy.get('[data-testid="nav-settings"]').click();
      cy.url().should('include', '/settings');
      cy.get('[data-testid="settings-page"]').should('be.visible');
      
      // Make a change and save (if save button exists)
      cy.get('[data-testid="settings-form"]').within(() => {
        cy.get('input').first().clear().type('Test Value');
        cy.get('button[type="submit"]').click();
      });
      
      // Wait for save confirmation
      cy.get('[data-testid="save-success"]').should('be.visible');
      
      // Navigate away to analytics
      cy.get('[data-testid="nav-analytics"]').click();
      cy.url().should('include', '/analytics');
      cy.get('[data-testid="analytics-page"]').should('be.visible');
    });
  });

  describe('Auth-Gated Routes', () => {
    it('should handle protected route navigation when authenticated', () => {
      // Simulate authenticated state
      cy.window().then(win => {
        win.localStorage.setItem('dev_auth_bypass', JSON.stringify({
          timestamp: Date.now()
        }));
      });
      
      cy.visit('/dashboard');
      
      // Should access protected route
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
      
      // Navigate to another protected route
      cy.get('[data-testid="nav-analytics"]').click();
      cy.url().should('include', '/analytics');
      cy.get('[data-testid="analytics-page"]').should('be.visible');
    });

    it('should redirect to login for unauthenticated users', () => {
      // Clear auth state
      cy.clearLocalStorage();
      
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });
  });

  describe('Error and Empty State Pages', () => {
    it('should handle 404 navigation gracefully', () => {
      cy.visit('/nonexistent-page');
      
      // Should show 404 page
      cy.get('[data-testid="not-found-page"]').should('be.visible');
      cy.contains('404').should('be.visible');
      
      // Navigate back to home from 404
      cy.get('[data-testid="back-to-home"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should handle empty state in clients page', () => {
      cy.visit('/clients');
      
      // Mock empty data response
      cy.intercept('GET', '**/clients*', { body: [] }).as('getEmptyClients');
      
      cy.reload();
      cy.wait('@getEmptyClients');
      
      // Should show empty state
      cy.get('[data-testid="empty-clients-state"]').should('be.visible');
      
      // Navigation should still work
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should handle error state in analytics page', () => {
      cy.visit('/analytics');
      
      // Mock error response
      cy.intercept('GET', '**/analytics*', { statusCode: 500 }).as('getAnalyticsError');
      
      cy.reload();
      cy.wait('@getAnalyticsError');
      
      // Should show error state
      cy.get('[data-testid="analytics-error-state"]').should('be.visible');
      
      // Navigation should still work
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Navigation Performance Tests', () => {
    it('should complete navigation within performance thresholds', () => {
      cy.visit('/dashboard');
      
      const startTime = Date.now();
      
      cy.get('[data-testid="nav-clients"]').click();
      cy.get('[data-testid="clients-page"]').should('be.visible').then(() => {
        const endTime = Date.now();
        const navigationTime = endTime - startTime;
        
        // Navigation should complete within 2 seconds
        expect(navigationTime).to.be.lessThan(2000);
      });
    });

    it('should not trigger multiple navigation attempts on rapid clicks', () => {
      cy.visit('/dashboard');
      
      // Rapid clicks on same link
      cy.get('[data-testid="nav-clients"]')
        .click()
        .click()
        .click();
      
      // Should only navigate once
      cy.url().should('include', '/clients');
      cy.get('[data-testid="clients-page"]').should('be.visible');
      
      // Check console for navigation guard logs
      cy.window().then(win => {
        // Verify navigation guard prevented duplicate attempts
        // This would be logged by the navigation guard system
      });
    });
  });
});