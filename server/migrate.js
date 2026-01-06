import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running database migrations...');

    // Run column migration FIRST for existing databases
    const migrationPath = path.join(__dirname, 'db', 'add_new_columns.sql');
    if (fs.existsSync(migrationPath)) {
      console.log('🔄 Running column migrations...');
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      await pool.query(migration);
    }

    // Then run main schema (which will create views with all columns)
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);

    console.log('✅ Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
