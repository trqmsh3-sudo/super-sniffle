@echo off
echo.
echo ============================================
echo PostgreSQL Setup for ClearPick.ai
echo ============================================
echo.

echo Checking for PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL not found!
    echo.
    echo Please download and install PostgreSQL:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo During installation:
    echo   - Username: postgres
    echo   - Password: choose a strong password
    echo   - Port: 5432
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

echo Enter PostgreSQL password for user 'postgres':
set /p PGPASSWORD=

echo.
echo Creating database 'clearpick'...
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE clearpick;" 2>nul
echo Database ready (if it existed, that's OK)
echo.

echo Creating tables from schema...
psql -U postgres -h localhost -p 5432 -d clearpick -f config\schema.sql
echo Tables created!
echo.

echo Verifying tables...
psql -U postgres -h localhost -p 5432 -d clearpick -c "\dt"
echo.

echo Testing connection with Node.js...
call npm run test-db

echo.
echo ============================================
echo PostgreSQL Setup Complete!
echo ============================================
echo.
echo Next steps:
echo   1. npm start
echo   2. npm run test-dossier
echo   3. Visit: http://localhost:3000/api/health
echo.
pause
