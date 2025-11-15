import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  try {
    console.log('Verifying database connection...');
    
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    console.log('Current time:', result.rows[0].now);
    
    // Check if database exists
    const dbResult = await pool.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'success_academy_db']
    );
    
    if (dbResult.rows.length > 0) {
      console.log(`Database '${process.env.DB_NAME || 'success_academy_db'}' exists`);
    } else {
      console.log(`Database '${process.env.DB_NAME || 'success_academy_db'}' NOT found`);
    }
    
    // Check if users table exists
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('Users table exists');
      
      // Count users
      const countResult = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`Total users in database: ${countResult.rows[0].count}`);
      
      // List users
      const usersResult = await pool.query('SELECT id, name, email, role, status FROM users LIMIT 10');
      console.log('\nUsers:');
      usersResult.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role} - ${user.status}`);
      });
    } else {
      console.log('Users table does NOT exist - run migrations');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database verification failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase();

