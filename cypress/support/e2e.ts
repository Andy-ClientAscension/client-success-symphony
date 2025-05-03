
// Import commands.ts using ES2015 syntax:
import './commands';

// Configure Cypress-axe
import 'cypress-axe';

// Hide fetch/XHR requests from command log
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Prevent TypeScript errors on Cypress global
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      checkAccessibility(context?: string): Chainable<void>;
      checkOfflineMode(shouldBeOffline: boolean): Chainable<void>;
      waitForSync(): Chainable<void>;
    }
  }
}
