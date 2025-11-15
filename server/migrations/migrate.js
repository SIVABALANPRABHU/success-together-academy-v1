import pool from '../config/database.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const createRolesTable = `
  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    can_self_register BOOLEAN DEFAULT false,
    home_page VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
  
  -- Add can_self_register column if table already exists
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'can_self_register'
    ) THEN
      ALTER TABLE roles ADD COLUMN can_self_register BOOLEAN DEFAULT false;
    END IF;
  END $$;
  
  -- Add home_page column if table already exists
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'roles' AND column_name = 'home_page'
    ) THEN
      ALTER TABLE roles ADD COLUMN home_page VARCHAR(500);
    END IF;
  END $$;
`;

const createUsersTable = async () => {
  // Check if users table exists
  const tableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    );
  `);
  
  if (!tableExists.rows[0].exists) {
    // Create users table with new structure
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'Active',
        password VARCHAR(255),
        thumbnail VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX idx_users_email ON users(email)');
    await pool.query('CREATE INDEX idx_users_role_id ON users(role_id)');
    await pool.query('CREATE INDEX idx_users_status ON users(status)');
  } else {
    // Table exists - check and add missing columns
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    const columnNames = columns.rows.map(r => r.column_name);
    
    // Add role_id if it doesn't exist
    if (!columnNames.includes('role_id')) {
      await pool.query('ALTER TABLE users ADD COLUMN role_id INTEGER');
      
      // Migrate old role column to role_id if it exists
      if (columnNames.includes('role')) {
        const roleMap = await pool.query('SELECT id, name FROM roles');
        for (const role of roleMap.rows) {
          await pool.query(
            `UPDATE users SET role_id = $1 WHERE role = $2`,
            [role.id, role.name]
          );
        }
        await pool.query('ALTER TABLE users DROP COLUMN role');
      }
      
      // Add foreign key constraint
      await pool.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
      `);
      
      // Create index
      await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id)');
    }
    
    // Add thumbnail if it doesn't exist
    if (!columnNames.includes('thumbnail')) {
      await pool.query('ALTER TABLE users ADD COLUMN thumbnail VARCHAR(500)');
    }
    
    // Ensure indexes exist
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');
  }
};

const insertRolesData = `
  INSERT INTO roles (name, description, can_self_register, home_page) VALUES
    ('Student', 'Student role for learning', true, '/student/dashboard'),
    ('Instructor', 'Instructor role for teaching', false, '/instructor/dashboard'),
    ('Admin', 'Administrator role for system management', false, '/admin')
  ON CONFLICT (name) DO UPDATE SET 
    can_self_register = EXCLUDED.can_self_register,
    description = EXCLUDED.description,
    home_page = EXCLUDED.home_page;
`;

const insertSampleData = async () => {
  // Get Student role ID
  const studentRole = await pool.query("SELECT id FROM roles WHERE name = 'Student' LIMIT 1");
  const instructorRole = await pool.query("SELECT id FROM roles WHERE name = 'Instructor' LIMIT 1");
  
  const studentRoleId = studentRole.rows[0]?.id;
  const instructorRoleId = instructorRole.rows[0]?.id;

  if (!studentRoleId || !instructorRoleId) {
    console.log('Roles not found, skipping sample data insertion');
    return;
  }

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  const insertQuery = `
    INSERT INTO users (name, email, role_id, status, password) VALUES
      ($1, $2, $3, 'Active', $4),
      ($5, $6, $7, 'Active', $8),
      ($9, $10, $11, 'Active', $12),
      ($13, $14, $15, 'Inactive', $16)
    ON CONFLICT (email) DO NOTHING;
  `;

  await pool.query(insertQuery, [
    'John Doe', 'john@example.com', studentRoleId, hashedPassword,
    'Jane Smith', 'jane@example.com', studentRoleId, hashedPassword,
    'Mike Johnson', 'mike@example.com', instructorRoleId, hashedPassword,
    'Sarah Williams', 'sarah@example.com', studentRoleId, hashedPassword
  ]);
};

async function waitForDatabase(maxRetries = 10, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connection established');
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        console.log(`Waiting for database... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error('Database connection failed after retries');
      }
    }
  }
}

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Wait for database to be ready
    await waitForDatabase();

    // Create roles table
    await pool.query(createRolesTable);
    console.log('Roles table created');

    // Insert roles data
    await pool.query(insertRolesData);
    console.log('Roles data inserted');

    // Create users table
    await createUsersTable();
    console.log('Users table created');

    // Insert sample data
    await insertSampleData();
    console.log('Sample data inserted');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

