@echo off
echo ========================================
echo   ClearPick.ai Backend Setup
echo ========================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/5] Setting up PostgreSQL...
echo Please make sure PostgreSQL is installed with:
echo - Username: postgres
echo - Password: postgres
echo - Port: 5432
echo.
pause

echo Creating database...
createdb -U postgres clearpick 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database created
) else (
    echo ⚠️ Database might already exist
)

echo Running schema...
psql -U postgres -d clearpick -f "config\schema.sql" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Schema created
) else (
    echo ⚠️ Schema might already exist
)

echo.
echo [4/5] Setting up environment...
if not exist ".env" (
    copy ".env.example" ".env"
    echo ✅ .env file created from example
) else (
    echo ⚠️ .env file already exists
)

echo.
echo [5/5] Testing database connection...
node -e "
const db = require('./config/database');
db.query('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  });
"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   🎉 Setup Complete!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Start the real server: node real-server.js
    echo 2. Or start mock server: node mock-server.js
    echo 3. Test with: curl http://localhost:5000/api/health
    echo.
) else (
    echo.
    echo ❌ Setup failed. Please check PostgreSQL installation.
    pause
)

pause
