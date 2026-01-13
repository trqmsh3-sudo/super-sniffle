#!/bin/bash

echo "🚀 ClearPick.ai - Automatic Deployment Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo -e "${BLUE}📦 Step 1: Building Frontend...${NC}"
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

# Step 2: Deploy to Vercel
echo -e "${BLUE}🌐 Step 2: Deploying to Vercel...${NC}"

# Create vercel.json if doesn't exist
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
EOF

# Deploy with Vercel CLI
# This will prompt for login if not logged in
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Your site is live!"
    echo "📍 Check: https://clearpick.vercel.app"
    echo ""
    echo "Next steps:"
    echo "1. Add custom domain in Vercel dashboard"
    echo "2. Update DNS in Namecheap"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo ""
echo "✅ Done!"
