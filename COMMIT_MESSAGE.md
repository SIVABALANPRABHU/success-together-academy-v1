feat: Implement feature-based permission system with dynamic sidebar and authentication

## Major Features Added

### 1. Feature-Based Permission System
- Created `features` table with name, icon, path, and description fields
- Created `permissions` table with feature-role combinations and CRUD flags
- Implemented Feature and Permission models with full CRUD operations
- Added API routes for features (`/api/features`) and permissions (`/api/permissions`)
- Created Features management page with CRUD and bulk operations
- Created Permissions management page with CRUD and bulk operations

### 2. Dynamic Sidebar from Database
- Sidebar now fetches features from database dynamically
- Icons and paths are pulled from feature records
- Sidebar items filtered based on user permissions (can_view)
- Auto-refreshes when features are updated
- Supports real-time updates via event system

### 3. Authentication System
- Implemented AuthContext for global authentication state
- Created Login and Register pages with form validation
- Added logout functionality
- Integrated role-based redirects after login
- Protected routes with ProtectedRoute component
- Updated Home page with dynamic auth state

### 4. SuperAdmin Role and Access Control
- Added SuperAdmin role to database
- Created default SuperAdmin user (superadmin@academy.com / admin@123)
- Updated admin routes to require SuperAdmin role
- Only SuperAdmin can access `/admin` dashboard

### 5. Role Management Enhancements
- Added `home_page` field to roles table for role-based redirects
- Updated role CRUD to support home_page field
- Login endpoint returns redirect_url based on role's home_page

### 6. Default Data
- Added default features: Dashboard, Users, Roles, Features, Permissions, Courses, Lessons, Payments, Analytics, Settings, My Courses, My Profile
- SuperAdmin: Full CRUD access to all admin features
- Student: Limited access (view/view_detail for My Courses, view/view_detail/edit for My Profile)

## Technical Changes

### Backend
- Added Feature and Permission models
- Created features and permissions API routes
- Updated migrations to create features and permissions tables
- Added default features and permissions data
- Updated auth routes to return role-based redirect URLs

### Frontend
- Created Features and Permissions management pages
- Added usePermissions hook for permission checking
- Updated AdminLayout to fetch features dynamically
- Integrated permission checks in UI components
- Added bulk operations (create, edit, delete) for features and permissions

### Database
- Created features table with icon and path fields
- Created permissions table with CRUD flags
- Added home_page field to roles table
- Added SuperAdmin role and default user

## Files Changed

### New Files
- server/models/Feature.js
- server/models/Permission.js
- server/routes/features.js
- server/routes/permissions.js
- src/pages/admin/Features.jsx
- src/pages/admin/Features.css
- src/pages/admin/Permissions.jsx
- src/pages/admin/Permissions.css
- src/pages/auth/Login.jsx
- src/pages/auth/Register.jsx
- src/pages/auth/Auth.css
- src/contexts/AuthContext.jsx
- src/hooks/usePermissions.js
- src/components/common/ProtectedRoute/ProtectedRoute.jsx
- SUPERADMIN_CREDENTIALS.md

### Modified Files
- server/migrations/migrate.js (added features/permissions tables and data)
- server/models/Role.js (added home_page support)
- server/routes/auth.js (added redirect_url in login response)
- server/routes/roles.js (added home_page support)
- server/server.js (added features and permissions routes)
- src/App.jsx (added auth routes and protected routes)
- src/layouts/AdminLayout.jsx (dynamic sidebar from database)
- src/pages/admin/Roles.jsx (added home_page field)
- src/pages/Home.jsx (integrated auth state)
- src/services/api.js (added features and permissions API methods)
- README.md (added SuperAdmin credentials section)

## Breaking Changes
- Admin routes now require SuperAdmin role (previously Admin role)
- Sidebar items are now dynamically generated from database

## Migration Notes
- Run database migration to create features and permissions tables
- Default SuperAdmin user will be created automatically
- Existing users need to be assigned appropriate roles

