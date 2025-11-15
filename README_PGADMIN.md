# pgAdmin 4 Setup Guide

## Access pgAdmin 4

After starting the Docker containers, pgAdmin 4 will be available at:

**Development:**
- URL: http://localhost:8888
- Email: admin@admin.com
- Password: admin

**Production:**
- URL: http://localhost:8888 (or 8889 if using main docker-compose.yml with production profile)

## Step-by-Step: Connecting to PostgreSQL Database in pgAdmin

### Step 1: Login to pgAdmin
1. Open your browser and go to `http://localhost:8888`
2. Login with:
   - Email: `admin@admin.com`
   - Password: `admin`

### Step 2: Register PostgreSQL Server
1. In the left sidebar, right-click on **"Servers"**
2. Select **"Register"** > **"Server..."**

### Step 3: Configure Server Connection

**General Tab:**
- **Name:** `Success Academy DB` (or any name you prefer)

**Connection Tab:**
- **Host name/address:** `postgres` (IMPORTANT: Use the Docker service name, NOT localhost)
- **Port:** `5432`
- **Maintenance database:** `success_academy_db`
- **Username:** `postgres`
- **Password:** `postgres`
- ✅ Check **"Save password"** if you want to save it

**Advanced Tab (Optional):**
- You can leave this empty or set DB restriction to `success_academy_db`

5. Click **"Save"**

### Step 4: View Database
After connecting, you should see:
- Expand **"Servers"** > **"Success Academy DB"** > **"Databases"**
- You should see **"success_academy_db"** database
- Expand it to see **"Schemas"** > **"public"** > **"Tables"**
- You should see the **"users"** table with sample data

## Database Connection Details

**For pgAdmin (inside Docker network):**
- **Host:** `postgres` (Docker service name - use this!)
- **Port:** `5432`
- **Database:** `success_academy_db`
- **Username:** `postgres`
- **Password:** `postgres`

**For external tools (from host machine):**
- **Host:** `localhost`
- **Port:** `5433` (mapped port on host)
- **Database:** `success_academy_db`
- **Username:** `postgres`
- **Password:** `postgres`

## Troubleshooting

### Database not visible?
1. Make sure you've registered the server connection (Step 2-3 above)
2. Check that the server connection is successful (green icon)
3. Expand the server tree: Servers > Success Academy DB > Databases
4. If database doesn't exist, check API container logs:
   ```bash
   docker logs success-academy-api
   ```
   Look for "Migration completed successfully"

### Connection failed?
- Make sure PostgreSQL container is running: `docker ps`
- Verify both containers are on the same network
- Try refreshing pgAdmin (F5)

### Verify Database Exists
Run this command to check:
```bash
docker exec -it success-academy-postgres psql -U postgres -l
```
You should see `success_academy_db` in the list.

## Notes

- The PostgreSQL container is accessible from pgAdmin via Docker's internal network using the service name `postgres`
- The database `success_academy_db` is created automatically when PostgreSQL starts (via POSTGRES_DB environment variable)
- Tables are created by the migration script when the API container starts
- pgAdmin data is persisted in a Docker volume, so your server connections will be saved between container restarts

