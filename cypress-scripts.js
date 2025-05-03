
#!/usr/bin/env node
/**
 * This script adds Cypress scripts to your package.json
 * without directly modifying the file
 */

const { execSync } = require('child_process');

// Add Cypress test scripts
console.log('Adding Cypress npm scripts...');

try {
  // Using npm to add scripts
  execSync('npm set-script cy:open "cypress open"');
  execSync('npm set-script cy:run "cypress run"');
  execSync('npm set-script cy:run:auth "cypress run --spec cypress/e2e/auth/**/*.cy.ts"');
  execSync('npm set-script cy:run:a11y "cypress run --spec cypress/e2e/a11y/**/*.cy.ts"');
  execSync('npm set-script cy:run:data "cypress run --spec cypress/e2e/data/**/*.cy.ts"');
  execSync('npm set-script test:e2e "cypress run"');
  
  console.log('Cypress scripts added successfully!');
  console.log('You can now run:');
  console.log('  npm run cy:open - to open Cypress in interactive mode');
  console.log('  npm run cy:run - to run all tests headlessly');
  console.log('  npm run cy:run:auth - to run authentication tests');
  console.log('  npm run cy:run:a11y - to run accessibility tests');
  console.log('  npm run test:e2e - to run all e2e tests in CI');
} catch (error) {
  console.error('Error adding Cypress scripts:', error.message);
  console.log('You can manually add these scripts to your package.json:');
  console.log(`{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:auth": "cypress run --spec cypress/e2e/auth/**/*.cy.ts",
    "cy:run:a11y": "cypress run --spec cypress/e2e/a11y/**/*.cy.ts",
    "cy:run:data": "cypress run --spec cypress/e2e/data/**/*.cy.ts",
    "test:e2e": "cypress run"
  }
}`);
}
