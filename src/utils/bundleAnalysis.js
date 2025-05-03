
#!/usr/bin/env node

// This script is used to analyze the bundle size of the application
// It will generate a source map and then analyze it using source-map-explorer

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building application with source maps...');

try {
  // Build with source maps
  execSync('npm run build -- --sourcemap', { stdio: 'inherit' });
  
  console.log('Analyzing bundle...');
  
  // Find the main JS file in the dist directory
  const distDir = path.join(process.cwd(), 'dist', 'assets');
  const files = fs.readdirSync(distDir);
  const jsFiles = files.filter(file => file.endsWith('.js') && file.includes('index'));
  
  if (jsFiles.length === 0) {
    console.error('No JS files found in the dist directory.');
    process.exit(1);
  }
  
  // Run source-map-explorer on the main JS file
  const mainJsFile = path.join(distDir, jsFiles[0]);
  const sourceMapFile = mainJsFile + '.map';
  
  if (!fs.existsSync(sourceMapFile)) {
    console.error('Source map file not found:', sourceMapFile);
    process.exit(1);
  }
  
  execSync(`npx source-map-explorer ${mainJsFile}`, { stdio: 'inherit' });
  
  console.log('Bundle analysis complete!');
} catch (error) {
  console.error('Error analyzing bundle:', error);
  process.exit(1);
}
