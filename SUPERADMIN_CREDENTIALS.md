# SuperAdmin Credentials

## Default SuperAdmin Account

A default SuperAdmin account has been created during database migration with the following credentials:

**Email:** `superadmin@academy.com`  
**Password:** `admin@123`

## Important Notes

⚠️ **SECURITY WARNING:**
- Change the default password immediately after first login
- This is a default credential and should be changed in production
- Only users with the "SuperAdmin" role can access the `/admin` pages
- Regular "Admin" role users cannot access admin pages (only SuperAdmin can)

## Access Control

- **SuperAdmin Role**: Full access to admin dashboard (`/admin`)
- **Admin Role**: Cannot access admin dashboard (for future use)
- **Instructor Role**: Access to instructor dashboard (`/instructor/dashboard`)
- **Student Role**: Access to student dashboard (`/student/dashboard`)

## How to Access Admin Dashboard

1. Navigate to `/login` page
2. Enter credentials:
   - Email: `superadmin@academy.com`
   - Password: `admin@123`
3. You will be automatically redirected to `/admin` dashboard

## Changing SuperAdmin Password

After logging in, you can change the password through:
- Admin Dashboard → Users → Edit SuperAdmin user → Update password

## Creating Additional SuperAdmin Users

Only existing SuperAdmin users can create new SuperAdmin users through:
- Admin Dashboard → Users → Add New User → Select "SuperAdmin" role

