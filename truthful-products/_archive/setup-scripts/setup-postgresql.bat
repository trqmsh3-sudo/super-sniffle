@echo off
echo Installing PostgreSQL for ClearPick.ai...
echo.

REM Check if PostgreSQL is already installed
pg_isready -V >nul 2>&1
if %errorlevel% equ 0 (
    echo PostgreSQL is already installed!
    echo.
    echo Checking if clearpick database exists...
    psql -U postgres -l | findstr clearpick >nul 2>&1
    if %errorlevel% equ 0 (
        echo Database clearpick already exists!
    ) else (
        echo Creating clearpick database...
        createdb -U postgres clearpick
        echo Database created successfully!
    )
) else (
    echo PostgreSQL not found. Please install PostgreSQL first:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Install with password: postgres
    echo 3. Add to PATH
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo Running schema...
psql -U postgres -d clearpick -f "config\schema.sql"

echo.
echo ✅ PostgreSQL setup complete!
echo Database: clearpick
echo User: postgres
echo Password: postgres
echo Port: 5432
echo.
pause
