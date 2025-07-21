#!/bin/bash

# Bash script to clean and reinstall dependencies with latest versions
echo "🧹 Cleaning up old dependencies..."

# Remove node_modules and lock files
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✅ Removed node_modules"
fi

if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo "✅ Removed package-lock.json"
fi

if [ -f "yarn.lock" ]; then
    rm -f yarn.lock
    echo "✅ Removed yarn.lock"
fi

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Install with latest versions
echo "📦 Installing dependencies with latest versions..."
npm install

# Audit for vulnerabilities
echo "🔍 Running security audit..."
npm audit

echo "✅ Clean installation complete!"
echo "🚀 Ready to build the extension!"
