// Quick verification script to check base image configuration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 VERIFYING BASE ID CARD TEMPLATE CONFIGURATION\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`   GEMINI_BASE_IMAGE_PATH: ${process.env.GEMINI_BASE_IMAGE_PATH || 'NOT SET'}`);
console.log(`   GEMINI_PROMPT_PATH: ${process.env.GEMINI_PROMPT_PATH || 'NOT SET'}`);

// Resolve paths
const DEFAULT_BASE_PATH = path.join(__dirname, 'utils', 'Base_image.jpg');
const ENV_BASE_PATH = process.env.GEMINI_BASE_IMAGE_PATH 
  ? path.resolve(process.env.GEMINI_BASE_IMAGE_PATH)
  : null;

console.log('\n📁 Resolved Paths:');
console.log(`   Default path: ${DEFAULT_BASE_PATH}`);
console.log(`   Env path: ${ENV_BASE_PATH || 'N/A'}`);

// Check if files exist
console.log('\n✅ File Existence Checks:');

const pathsToCheck = [
  { label: 'Default Base Image', path: DEFAULT_BASE_PATH },
];

if (ENV_BASE_PATH && ENV_BASE_PATH !== DEFAULT_BASE_PATH) {
  pathsToCheck.push({ label: 'Env Base Image', path: ENV_BASE_PATH });
}

pathsToCheck.forEach(({ label, path: filePath }) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${label}:`);
    console.log(`      Path: ${filePath}`);
    console.log(`      Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`      Modified: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`   ❌ ${label}: NOT FOUND at ${filePath}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Verification complete!\n');
