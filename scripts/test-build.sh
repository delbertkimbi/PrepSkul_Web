#!/bin/bash

# Test script to verify the build will work on Vercel
# Run this before pushing to delbert branch

set -e  # Exit on error

echo "🔍 Testing build locally (same as Vercel)..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from PrepSkul_Web directory"
  exit 1
fi

# Step 1: Check TypeScript compilation
echo "📝 Step 1: Checking TypeScript compilation..."
if command -v npx &> /dev/null; then
  npx tsc --noEmit || {
    echo "❌ TypeScript errors found! Fix these before pushing."
    exit 1
  }
  echo "✅ TypeScript check passed"
else
  echo "⚠️  npx not found, skipping TypeScript check"
fi
echo ""

# Step 2: Run the build (same command Vercel runs)
echo "🔨 Step 2: Running production build (pnpm run build)..."
echo "   This is the EXACT command Vercel runs"
echo ""

# Use pnpm if available, fallback to npm
if command -v pnpm &> /dev/null; then
  pnpm run build
elif command -v npm &> /dev/null; then
  npm run build
else
  echo "❌ Error: Neither pnpm nor npm found"
  exit 1
fi

echo ""
echo "✅ Build successful! Your code should deploy to Vercel without errors."
echo ""
echo "💡 Next steps:"
echo "   1. Review any warnings above"
echo "   2. If build passed, you can safely push to delbert branch"
echo "   3. Monitor Vercel deployment for any runtime issues"

