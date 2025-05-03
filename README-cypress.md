
# Cypress End-to-End Tests

## Setup

The project is configured with Cypress for end-to-end testing. The tests cover:

1. Authentication flows (login, error states, password reset)
2. Data synchronization and offline functionality
3. Accessibility compliance
4. Full user journeys

## Running Tests

To run the Cypress tests, use the following commands:

```bash
# Open Cypress in interactive mode
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run specific test suites
npm run cy:run:auth
npm run cy:run:a11y
npm run cy:run:data
```

## Test Structure

- `cypress/e2e/auth/` - Authentication tests
- `cypress/e2e/data/` - Data sync and offline tests 
- `cypress/e2e/a11y/` - Accessibility tests
- `cypress/e2e/journeys/` - End-to-end user journeys

## Custom Commands

Custom Cypress commands have been added to simplify test writing:

- `cy.login(email, password)` - Login with provided credentials
- `cy.checkAccessibility(context)` - Run accessibility tests on current page
- `cy.checkOfflineMode(shouldBeOffline)` - Test offline functionality
- `cy.waitForSync()` - Wait for data synchronization to complete

## Extending Tests

To add new tests:

1. Create a new file in the appropriate directory under `cypress/e2e/`
2. Follow the existing patterns for setup and assertions
3. Use custom commands where possible to reduce duplication

For more information, refer to the [Cypress documentation](https://docs.cypress.io/).
