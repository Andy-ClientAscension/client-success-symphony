
/**
 * Type Checker Utility
 * 
 * This file serves as a helper to run type checking with strict settings
 * without modifying the read-only tsconfig.json file.
 * 
 * Run with: npx ts-node src/utils/typeChecker.ts
 * or add a script to package.json: "type-check": "tsc --project tsconfig.ci.json --noEmit"
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Runs TypeScript compiler with strict settings
 */
function runTypeChecker() {
  console.log('Running TypeScript type checking with strict settings...');
  
  // Ensure the tsconfig.ci.json exists
  const configPath = path.resolve(process.cwd(), 'tsconfig.ci.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: tsconfig.ci.json not found!');
    process.exit(1);
  }
  
  // Run TypeScript compiler with the CI config
  const result = spawnSync('npx', ['tsc', '--project', 'tsconfig.ci.json', '--noEmit'], {
    stdio: 'inherit',
    shell: true
  });
  
  if (result.status !== 0) {
    console.error('Type checking failed with strict settings!');
    process.exit(1);
  }
  
  console.log('✅ Type checking passed with strict settings!');
}

// Run the type checker if this file is executed directly
if (require.main === module) {
  runTypeChecker();
}

export { runTypeChecker };
