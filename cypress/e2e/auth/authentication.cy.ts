
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/login');
  });

  it('should successfully login with valid credentials', () => {
    // Use test credentials (you'll need to replace these with valid ones for your env)
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should handle login error and show error message', () => {
    // Use invalid credentials
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongpassword';
    
    cy.get('input[id="email"]').type(invalidEmail);
    cy.get('input[id="password"]').type(invalidPassword);
    cy.get('button[type="submit"]').click();
    
    // Verify error is displayed
    cy.contains('Invalid email or password').should('be.visible');
    cy.url().should('include', '/login'); // Remain on login page
  });

  it('should trigger rate limiting after multiple failed attempts', () => {
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongpassword';
    
    // Attempt login multiple times to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      cy.get('input[id="email"]').clear().type(invalidEmail);
      cy.get('input[id="password"]').clear().type(invalidPassword);
      cy.get('button[type="submit"]').click();
      cy.wait(500); // Small wait between attempts
    }
    
    // Verify rate limit message
    cy.contains('Too many login attempts').should('be.visible');
    cy.contains('Please try again').should('be.visible');
  });

  it('should handle password reset flow', () => {
    // Click on forgot password link
    cy.contains('Forgot your password?').click();
    
    // Verify forgot password form
    cy.contains('Reset your password').should('be.visible');
    
    // Enter email for reset
    const testEmail = 'test@example.com';
    cy.get('input[type="email"]').type(testEmail);
    cy.contains('button', 'Send reset link').click();
    
    // Verify success message
    cy.contains('Password reset email sent').should('be.visible');
  });
  
  it('should navigate back to login from reset password page', () => {
    // Go to reset password page
    cy.contains('Forgot your password?').click();
    
    // Navigate back to login
    cy.contains('Back to login').click();
    
    // Verify we're back at login
    cy.get('input[id="email"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');
  });
});
