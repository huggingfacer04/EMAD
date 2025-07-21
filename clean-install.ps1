# PowerShell script to clean and reinstall dependencies with latest versions
Write-Host "🧹 Cleaning up old dependencies..." -ForegroundColor Yellow

# Remove node_modules and lock files
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

if (Test-Path "yarn.lock") {
    Remove-Item -Force "yarn.lock"
    Write-Host "✅ Removed yarn.lock" -ForegroundColor Green
}

# Clear npm cache
Write-Host "🗑️ Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install with latest versions
Write-Host "📦 Installing dependencies with latest versions..." -ForegroundColor Yellow
npm install

# Audit for vulnerabilities
Write-Host "🔍 Running security audit..." -ForegroundColor Yellow
npm audit

Write-Host "✅ Clean installation complete!" -ForegroundColor Green
Write-Host "🚀 Ready to build the extension!" -ForegroundColor Cyan
