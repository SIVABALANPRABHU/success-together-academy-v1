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

const createFeaturesTable = `
  CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    path VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_features_name ON features(name);
  CREATE INDEX IF NOT EXISTS idx_features_path ON features(path);
`;

const createPermissionsTable = `
  CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_view_detail BOOLEAN DEFAULT false,
    can_add BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(feature_id, role_id)
  );

  CREATE INDEX IF NOT EXISTS idx_permissions_feature_id ON permissions(feature_id);
  CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
`;

const createContentsTable = async () => {
  // Check if contents table exists
  const tableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'contents'
    );
  `);
  
  if (!tableExists.rows[0].exists) {
    // Create contents table
    await pool.query(`
      CREATE TABLE contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'file', 'markdown', 'image')),
        content_source VARCHAR(50) NOT NULL CHECK (content_source IN ('internal', 'external')),
        content_url TEXT NOT NULL,
        thumbnail_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        metadata JSONB,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await pool.query('CREATE INDEX idx_contents_content_type ON contents(content_type)');
    await pool.query('CREATE INDEX idx_contents_content_source ON contents(content_source)');
    await pool.query('CREATE INDEX idx_contents_status ON contents(status)');
    await pool.query('CREATE INDEX idx_contents_created_by ON contents(created_by)');
    await pool.query('CREATE INDEX idx_contents_title ON contents(title)');
  } else {
    // Table exists - ensure indexes exist
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contents_content_type ON contents(content_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contents_content_source ON contents(content_source)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contents_created_by ON contents(created_by)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contents_title ON contents(title)');
  }
};

const createCourseManagementTables = async () => {
  // Create pages table
  const pagesTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pages'
    );
  `);
  
  if (!pagesTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        content_id INTEGER REFERENCES contents(id) ON DELETE SET NULL,
        order_index INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX idx_pages_content_id ON pages(content_id)');
    await pool.query('CREATE INDEX idx_pages_status ON pages(status)');
    await pool.query('CREATE INDEX idx_pages_order ON pages(order_index)');
  } else {
    // Table exists - check and add missing columns
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pages' 
        AND column_name = 'order_index'
      );
    `);
    if (!columnExists.rows[0].exists) {
      await pool.query('ALTER TABLE pages ADD COLUMN order_index INTEGER DEFAULT 0');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_pages_order ON pages(order_index)');
    }
  }

  // Create chapters table
  const chaptersTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'chapters'
    );
  `);
  
  if (!chaptersTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE chapters (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX idx_chapters_status ON chapters(status)');
    await pool.query('CREATE INDEX idx_chapters_order ON chapters(order_index)');
  } else {
    // Table exists - check and add missing columns
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chapters' 
        AND column_name = 'order_index'
      );
    `);
    if (!columnExists.rows[0].exists) {
      await pool.query('ALTER TABLE chapters ADD COLUMN order_index INTEGER DEFAULT 0');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index)');
    }
  }

  // Create courses table
  const coursesTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'courses'
    );
  `);
  
  if (!coursesTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX idx_courses_status ON courses(status)');
    await pool.query('CREATE INDEX idx_courses_order ON courses(order_index)');
  } else {
    // Table exists - check and add missing columns
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'order_index'
      );
    `);
    if (!columnExists.rows[0].exists) {
      await pool.query('ALTER TABLE courses ADD COLUMN order_index INTEGER DEFAULT 0');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(order_index)');
    }
  }

  // Create menus table
  const menusTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'menus'
    );
  `);
  
  if (!menusTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE menus (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX idx_menus_status ON menus(status)');
    await pool.query('CREATE INDEX idx_menus_order ON menus(order_index)');
  } else {
    // Table exists - check and add missing columns
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'menus' 
        AND column_name = 'order_index'
      );
    `);
    if (!columnExists.rows[0].exists) {
      await pool.query('ALTER TABLE menus ADD COLUMN order_index INTEGER DEFAULT 0');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(order_index)');
    }
  }

  // Create chapter_pages junction table (chapters contain pages in order)
  const chapterPagesExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'chapter_pages'
    );
  `);
  
  if (!chapterPagesExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE chapter_pages (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chapter_id, page_id)
      );
    `);
    await pool.query('CREATE INDEX idx_chapter_pages_chapter ON chapter_pages(chapter_id)');
    await pool.query('CREATE INDEX idx_chapter_pages_page ON chapter_pages(page_id)');
    await pool.query('CREATE INDEX idx_chapter_pages_order ON chapter_pages(chapter_id, order_index)');
  }

  // Create course_chapters junction table (courses contain chapters in order)
  const courseChaptersExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'course_chapters'
    );
  `);
  
  if (!courseChaptersExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE course_chapters (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, chapter_id)
      );
    `);
    await pool.query('CREATE INDEX idx_course_chapters_course ON course_chapters(course_id)');
    await pool.query('CREATE INDEX idx_course_chapters_chapter ON course_chapters(chapter_id)');
    await pool.query('CREATE INDEX idx_course_chapters_order ON course_chapters(course_id, order_index)');
  }

  // Create menu_courses junction table (menus contain courses in order)
  const menuCoursesExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'menu_courses'
    );
  `);
  
  if (!menuCoursesExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE menu_courses (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(menu_id, course_id)
      );
    `);
    await pool.query('CREATE INDEX idx_menu_courses_menu ON menu_courses(menu_id)');
    await pool.query('CREATE INDEX idx_menu_courses_course ON menu_courses(course_id)');
    await pool.query('CREATE INDEX idx_menu_courses_order ON menu_courses(menu_id, order_index)');
  }
};

const createSubscriptionManagementTables = async () => {
  // Create packages table
  const packagesTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'packages'
    );
  `);
  
  if (!packagesTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration_days INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
        package_type VARCHAR(50) DEFAULT 'basic' CHECK (package_type IN ('free', 'basic', 'intermediate', 'advanced', 'premium')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX idx_packages_menu_id ON packages(menu_id)');
    await pool.query('CREATE INDEX idx_packages_status ON packages(status)');
    await pool.query('CREATE INDEX idx_packages_type ON packages(package_type)');
  } else {
    // Table exists - check and add missing columns
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'packages' 
        AND column_name = 'package_type'
      );
    `);
    if (!columnExists.rows[0].exists) {
      await pool.query('ALTER TABLE packages ADD COLUMN package_type VARCHAR(50) DEFAULT \'basic\' CHECK (package_type IN (\'free\', \'basic\', \'intermediate\', \'advanced\', \'premium\'))');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(package_type)');
    }
  }

  // Create package_courses junction table (packages contain courses)
  const packageCoursesExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'package_courses'
    );
  `);
  
  if (!packageCoursesExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE package_courses (
        id SERIAL PRIMARY KEY,
        package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(package_id, course_id)
      );
    `);
    await pool.query('CREATE INDEX idx_package_courses_package ON package_courses(package_id)');
    await pool.query('CREATE INDEX idx_package_courses_course ON package_courses(course_id)');
  }

  // Create offers table
  const offersTableExists = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'offers'
    );
  `);
  
  if (!offersTableExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE offers (
        id SERIAL PRIMARY KEY,
        package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
        offer_text TEXT NOT NULL,
        discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (end_date > start_date)
      );
    `);
    await pool.query('CREATE INDEX idx_offers_package_id ON offers(package_id)');
    await pool.query('CREATE INDEX idx_offers_status ON offers(status)');
    await pool.query('CREATE INDEX idx_offers_dates ON offers(start_date, end_date)');
  }
};

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
    ('Admin', 'Administrator role for system management', false, '/admin'),
    ('SuperAdmin', 'Super Administrator with full system access', false, '/admin')
  ON CONFLICT (name) DO UPDATE SET 
    can_self_register = EXCLUDED.can_self_register,
    description = EXCLUDED.description,
    home_page = EXCLUDED.home_page;
`;

const insertSampleData = async () => {
  // Get role IDs
  const studentRole = await pool.query("SELECT id FROM roles WHERE name = 'Student' LIMIT 1");
  const instructorRole = await pool.query("SELECT id FROM roles WHERE name = 'Instructor' LIMIT 1");
  const superAdminRole = await pool.query("SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1");
  
  const studentRoleId = studentRole.rows[0]?.id;
  const instructorRoleId = instructorRole.rows[0]?.id;
  const superAdminRoleId = superAdminRole.rows[0]?.id;

  if (!studentRoleId || !instructorRoleId || !superAdminRoleId) {
    console.log('Roles not found, skipping sample data insertion');
    return;
  }

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const superAdminPassword = await bcrypt.hash('admin@123', 10);

  // Insert sample users
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

  // Insert SuperAdmin user
  const superAdminQuery = `
    INSERT INTO users (name, email, role_id, status, password) VALUES
      ($1, $2, $3, 'Active', $4)
    ON CONFLICT (email) DO UPDATE SET
      role_id = EXCLUDED.role_id,
      password = EXCLUDED.password,
      status = EXCLUDED.status;
  `;

  await pool.query(superAdminQuery, [
    'Super Admin',
    'superadmin@academy.com',
    superAdminRoleId,
    superAdminPassword
  ]);

  console.log('SuperAdmin user created:');
  console.log('Email: superadmin@academy.com');
  console.log('Password: admin@123');
};

const insertFeaturesData = async () => {
  const features = [
    { name: 'Dashboard', icon: '📊', path: '/admin', description: 'Admin Dashboard' },
    { name: 'Users', icon: '👥', path: '/admin/users', description: 'User Management' },
    { name: 'Roles', icon: '🎭', path: '/admin/roles', description: 'Role Management' },
    { name: 'Features', icon: '⚙️', path: '/admin/features', description: 'Feature Management' },
    { name: 'Permissions', icon: '🔐', path: '/admin/permissions', description: 'Permission Management' },
    { name: 'Content Management', icon: '📄', path: '/admin/contents', description: 'Content Management (Video, File, Markdown, Image)' },
    { name: 'Menus', icon: '📋', path: '/admin/menus', description: 'Menu Management' },
    { name: 'Courses', icon: '📚', path: '/admin/courses', description: 'Course Management' },
    { name: 'Chapters', icon: '📑', path: '/admin/chapters', description: 'Chapter Management' },
    { name: 'Pages', icon: '📄', path: '/admin/pages', description: 'Page Management' },
    { name: 'Packages', icon: '📦', path: '/admin/packages', description: 'Package Management' },
    { name: 'Offers', icon: '🎁', path: '/admin/offers', description: 'Offer Management' },
    { name: 'Lessons', icon: '📝', path: '/admin/lessons', description: 'Lesson Management' },
    { name: 'Payments', icon: '💳', path: '/admin/payments', description: 'Payment Management' },
    { name: 'Analytics', icon: '📈', path: '/admin/analytics', description: 'Analytics Dashboard' },
    { name: 'Settings', icon: '⚙️', path: '/admin/settings', description: 'System Settings' },
    { name: 'My Courses', icon: '📖', path: '/student/courses', description: 'Student Courses' },
    { name: 'My Profile', icon: '👤', path: '/student/profile', description: 'Student Profile' },
  ];

  for (const feature of features) {
    await pool.query(
      `INSERT INTO features (name, icon, path, description) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE SET 
         icon = EXCLUDED.icon,
         path = EXCLUDED.path,
         description = EXCLUDED.description`,
      [feature.name, feature.icon, feature.path, feature.description]
    );
  }
};

const insertPermissionsData = async () => {
  // Get role IDs
  const studentRole = await pool.query("SELECT id FROM roles WHERE name = 'Student' LIMIT 1");
  const superAdminRole = await pool.query("SELECT id FROM roles WHERE name = 'SuperAdmin' LIMIT 1");
  
  const studentRoleId = studentRole.rows[0]?.id;
  const superAdminRoleId = superAdminRole.rows[0]?.id;

  if (!studentRoleId || !superAdminRoleId) {
    console.log('Roles not found, skipping permissions insertion');
    return;
  }

  // Get feature IDs
  const features = await pool.query('SELECT id, name FROM features');
  const featureMap = {};
  features.rows.forEach(f => {
    featureMap[f.name] = f.id;
  });

  // SuperAdmin permissions - Full access to all admin features
  const superAdminFeatures = [
    'Dashboard', 'Users', 'Roles', 'Features', 'Permissions', 'Content Management',
    'Menus', 'Courses', 'Chapters', 'Pages', 'Packages', 'Offers', 'Lessons', 'Payments', 'Analytics', 'Settings'
  ];

  for (const featureName of superAdminFeatures) {
    const featureId = featureMap[featureName];
    if (featureId) {
      await pool.query(
        `INSERT INTO permissions (feature_id, role_id, can_view, can_view_detail, can_add, can_edit, can_delete)
         VALUES ($1, $2, true, true, true, true, true)
         ON CONFLICT (feature_id, role_id) DO UPDATE SET
           can_view = true,
           can_view_detail = true,
           can_add = true,
           can_edit = true,
           can_delete = true`,
        [featureId, superAdminRoleId]
      );
    }
  }

  // Student permissions - Limited access
  const studentFeatures = [
    { name: 'My Courses', view: true, view_detail: true, add: false, edit: false, delete: false },
    { name: 'My Profile', view: true, view_detail: true, add: false, edit: true, delete: false },
  ];

  for (const feature of studentFeatures) {
    const featureId = featureMap[feature.name];
    if (featureId) {
      await pool.query(
        `INSERT INTO permissions (feature_id, role_id, can_view, can_view_detail, can_add, can_edit, can_delete)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (feature_id, role_id) DO UPDATE SET
           can_view = EXCLUDED.can_view,
           can_view_detail = EXCLUDED.can_view_detail,
           can_add = EXCLUDED.can_add,
           can_edit = EXCLUDED.can_edit,
           can_delete = EXCLUDED.can_delete`,
        [
          featureId, 
          studentRoleId, 
          feature.view, 
          feature.view_detail, 
          feature.add, 
          feature.edit, 
          feature.delete
        ]
      );
    }
  }
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

    // Create features table
    await pool.query(createFeaturesTable);
    console.log('Features table created');

    // Create permissions table
    await pool.query(createPermissionsTable);
    console.log('Permissions table created');

    // Create contents table
    await createContentsTable();
    console.log('Contents table created');

    // Create course management tables
    await createCourseManagementTables();
    console.log('Course management tables created');

    // Create subscription management tables
    await createSubscriptionManagementTables();
    console.log('Subscription management tables created');

    // Insert features data
    await insertFeaturesData();
    console.log('Features data inserted');

    // Insert permissions data
    await insertPermissionsData();
    console.log('Permissions data inserted');

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

