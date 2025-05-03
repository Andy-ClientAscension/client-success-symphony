
describe('Accessibility Compliance', () => {
  beforeEach(() => {
    // Reset state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('login page should be accessible', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkAccessibility('Login Page');
  });

  it('dashboard should be accessible', () => {
    // Login first
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    cy.login(testEmail, testPassword);
    
    // Check dashboard accessibility
    cy.visit('/dashboard');
    cy.injectAxe();
    cy.checkAccessibility('Dashboard');
  });

  it('should have proper keyboard navigation', () => {
    cy.visit('/login');
    
    // Focus should start on email field
    cy.get('body').tab();
    cy.focused().should('have.attr', 'id', 'email');
    
    // Tab to password
    cy.focused().tab();
    cy.focused().should('have.attr', 'id', 'password');
    
    // Tab to login button
    cy.focused().tab();
    cy.focused().should('have.text', 'Login').and('have.attr', 'type', 'submit');
    
    // Tab to forgot password
    cy.focused().tab();
    cy.focused().should('have.text', 'Forgot your password?');
  });

  it('should have proper ARIA attributes', () => {
    cy.visit('/login');
    
    // Check for proper form labeling
    cy.get('form').should('have.attr', 'aria-labelledby');
    
    // Check input fields have proper labels
    cy.get('input[id="email"]').should('have.attr', 'aria-invalid', 'false');
    
    // Check error messages use correct ARIA attributes
    cy.get('input[id="email"]').clear().blur();
    cy.get('[aria-invalid="true"]').should('exist');
    cy.get('[aria-describedby]').should('exist');
  });
});
