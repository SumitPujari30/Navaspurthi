const fs = require('fs');
const path = require('path');

/**
 * Display the database schema for easy copying
 * Run this script to see the SQL you need to paste into Supabase
 */

console.log('\n' + '='.repeat(70));
console.log('📋 SUPABASE DATABASE SCHEMA');
console.log('='.repeat(70));
console.log('\nCopy the SQL below and paste it into Supabase SQL Editor:\n');
console.log('='.repeat(70) + '\n');

const schemaPath = path.join(__dirname, '../database/schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found at:', schemaPath);
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log(schemaSql);

console.log('\n' + '='.repeat(70));
console.log('✅ Copy the SQL above and run it in Supabase SQL Editor');
console.log('='.repeat(70) + '\n');
