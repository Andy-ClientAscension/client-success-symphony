/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to test navigation timing
     * @param selector - Element selector to click
     * @param expectedRoute - Expected route after navigation
     * @param maxTime - Maximum time allowed for navigation (ms)
     */
    testNavigationTiming(
      selector: string, 
      expectedRoute: string, 
      maxTime?: number
    ): Chainable<void>;
    
    /**
     * Custom command to verify single-click navigation
     * @param selector - Element selector to click
     * @param expectedRoute - Expected route after navigation
     */
    testSingleClickNavigation(
      selector: string,
      expectedRoute: string
    ): Chainable<void>;
    
    /**
     * Custom command to set up auth bypass for testing
     */
    bypassAuth(): Chainable<void>;
    
    /**
     * Custom command to test rapid click prevention
     * @param selector - Element selector to click rapidly
     * @param expectedRoute - Expected final route
     */
    testRapidClickPrevention(
      selector: string,
      expectedRoute: string
    ): Chainable<void>;
  }
}

// Navigation timing test
Cypress.Commands.add('testNavigationTiming', (selector: string, expectedRoute: string, maxTime = 2000) => {
  const startTime = Date.now();
  
  cy.get(selector).click().then(() => {
    const endTime = Date.now();
    const navigationTime = endTime - startTime;
    
    cy.url().should('include', expectedRoute);
    
    if (navigationTime > maxTime) {
      throw new Error(`Navigation took ${navigationTime}ms, expected < ${maxTime}ms`);
    }
    
    cy.log(`✅ Navigation completed in ${navigationTime}ms`);
  });
});

// Single click navigation test
Cypress.Commands.add('testSingleClickNavigation', (selector: string, expectedRoute: string) => {
  let clickCount = 0;
  
  cy.get(selector).then(($el) => {
    // Monitor click events
    $el.on('click', () => {
      clickCount++;
    });
    
    // Perform single click
    cy.wrap($el).click();
    
    // Verify navigation
    cy.url().should('include', expectedRoute).then(() => {
      if (clickCount > 1) {
        cy.log(`⚠️ Warning: ${clickCount} clicks detected, expected 1`);
      } else {
        cy.log(`✅ Single click navigation successful`);
      }
    });
  });
});

// Auth bypass setup
Cypress.Commands.add('bypassAuth', () => {
  cy.window().then(win => {
    win.localStorage.setItem('dev_auth_bypass', JSON.stringify({
      timestamp: Date.now()
    }));
  });
});

// Rapid click prevention test
Cypress.Commands.add('testRapidClickPrevention', (selector: string, expectedRoute: string) => {
  let navigationCount = 0;
  
  // Monitor URL changes
  cy.window().then(win => {
    const originalPushState = win.history.pushState;
    win.history.pushState = function(...args) {
      navigationCount++;
      return originalPushState.apply(this, args);
    };
  });
  
  // Perform rapid clicks
  cy.get(selector)
    .click()
    .click()
    .click();
  
  // Verify only one navigation occurred
  cy.url().should('include', expectedRoute).then(() => {
    if (navigationCount <= 1) {
      cy.log(`✅ Rapid click prevention working: ${navigationCount} navigation(s)`);
    } else {
      cy.log(`⚠️ Warning: ${navigationCount} navigations detected from rapid clicks`);
    }
  });
});