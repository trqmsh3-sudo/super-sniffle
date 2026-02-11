# PostgreSQL Setup Script for ClearPick.ai
# Windows PowerShell Script

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🗄️  ClearPick.ai - PostgreSQL Setup            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if PostgreSQL is installed
Write-Host "🔍 Checking for PostgreSQL..." -ForegroundColor Yellow

$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL not found!`n" -ForegroundColor Red
    Write-Host "📥 Please download and install PostgreSQL:" -ForegroundColor Yellow
    Write-Host "   https://www.postgresql.org/download/windows/`n" -ForegroundColor White
    Write-Host "   During installation:" -ForegroundColor White
    Write-Host "   - Username: postgres" -ForegroundColor White
    Write-Host "   - Password: <choose a strong password>" -ForegroundColor White
    Write-Host "   - Port: 5432`n" -ForegroundColor White
    Write-Host "   After installation, run this script again!" -ForegroundColor Green
    exit 1
}

Write-Host "✅ PostgreSQL found!`n" -ForegroundColor Green

# Get database password
Write-Host "🔑 Enter PostgreSQL password for user 'postgres':" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Set environment variable for psql
$env:PGPASSWORD = $passwordPlain

# Create database
Write-Host "`n📦 Creating database 'clearpick'..." -ForegroundColor Yellow

$createDb = @"
SELECT 'CREATE DATABASE clearpick'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'clearpick')\gexec
"@

$createDb | psql -U postgres -h localhost -p 5432 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'clearpick' ready`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database might already exist (this is OK)`n" -ForegroundColor Yellow
}

# Run schema
Write-Host "📋 Creating tables from schema.sql..." -ForegroundColor Yellow

psql -U postgres -h localhost -p 5432 -d clearpick -f config/schema.sql 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tables created successfully`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tables might already exist (this is OK)`n" -ForegroundColor Yellow
}

# Verify tables
Write-Host "🔍 Verifying tables..." -ForegroundColor Yellow

$tables = psql -U postgres -h localhost -p 5432 -d clearpick -t -c "\dt" 2>&1

Write-Host "`n📊 Tables found:" -ForegroundColor Cyan
Write-Host $tables

# Update .env file
Write-Host "`n📝 Updating .env file..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    # Update DB_PASSWORD if it says "your_password_here"
    if ($envContent -match "DB_PASSWORD=your_password_here") {
        $envContent = $envContent -replace "DB_PASSWORD=your_password_here", "DB_PASSWORD=$passwordPlain"
        Set-Content ".env" $envContent
        Write-Host "✅ .env updated with database password`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env already has a password set`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env file not found - please create it manually`n" -ForegroundColor Yellow
}

# Test connection
Write-Host "🧪 Testing database connection..." -ForegroundColor Yellow

npm run test-db

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ PostgreSQL Setup Complete!                   ║" -ForegroundColor Green  
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. npm start              → Start server" -ForegroundColor White
Write-Host "   2. npm run test-dossier   → Build a test dossier" -ForegroundColor White
Write-Host "   3. Check: http://localhost:3000/api/health`n" -ForegroundColor White

# Clear password from environment
$env:PGPASSWORD = ""
