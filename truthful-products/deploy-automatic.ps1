# ClearPick.ai - Automatic Deployment to Vercel
# Run this script and everything will be deployed automatically!

Write-Host "`n🚀 ClearPick.ai - Automatic Deployment" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Step 1: Navigate to frontend
Write-Host "📂 Step 1: Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location -Path ".\frontend"

# Step 2: Install dependencies
Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Build
Write-Host "`n🏗️  Step 3: Building production bundle..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed! Check errors above.`n" -ForegroundColor Red
    exit 1
}

# Step 4: Create vercel.json with correct settings
Write-Host "⚙️  Step 4: Creating Vercel configuration..." -ForegroundColor Yellow

$vercelConfig = @"
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
"@

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding utf8
Write-Host "✅ Configuration created!`n" -ForegroundColor Green

# Step 5: Deploy to Vercel
Write-Host "🌐 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "   (This will open a browser for login if needed)`n" -ForegroundColor Gray

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n`n" -ForegroundColor Green
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  🎉 DEPLOYMENT SUCCESSFUL! 🎉          ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host "`n"
    Write-Host "✅ Your site is live!" -ForegroundColor Green
    Write-Host "`n📍 URLs:" -ForegroundColor Cyan
    Write-Host "   - Production: https://clearpick.vercel.app" -ForegroundColor White
    Write-Host "   - Or check Vercel dashboard for exact URL" -ForegroundColor Gray
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Add custom domain (clearpickai.com) in Vercel" -ForegroundColor White
    Write-Host "   2. Update DNS in Namecheap" -ForegroundColor White
    Write-Host "   3. Deploy backend to Render" -ForegroundColor White
    Write-Host "`n💡 See DEPLOY_CLEARPICKAI_COM.md for detailed instructions`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Deployment failed!`n" -ForegroundColor Red
    Write-Host "💡 Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Not logged in - run: vercel login" -ForegroundColor White
    Write-Host "   2. No internet connection" -ForegroundColor White
    Write-Host "   3. Vercel account issue`n" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Script completed!`n" -ForegroundColor Green
