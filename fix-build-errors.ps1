# PowerShell script to fix build errors and test compilation
Write-Host "🔧 Fixing BMAD VS Code Extension Build Errors..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Clean output directories
Write-Host "`n🧹 Cleaning output directories..." -ForegroundColor Yellow
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
    Write-Host "✅ Removed out directory" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Removed dist directory" -ForegroundColor Green
}

# Test TypeScript compilation
Write-Host "`n🔨 Testing TypeScript compilation..." -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Gray

$compileResult = npm run compile 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript compilation failed:" -ForegroundColor Red
    Write-Host $compileResult -ForegroundColor Red
    Write-Host "`n🔍 Checking tsconfig.json..." -ForegroundColor Yellow
    
    if (Test-Path "tsconfig.json") {
        Write-Host "✅ tsconfig.json exists" -ForegroundColor Green
    } else {
        Write-Host "❌ tsconfig.json missing!" -ForegroundColor Red
    }
    
    if (Test-Path "src") {
        $srcFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" | Measure-Object
        Write-Host "✅ Found $($srcFiles.Count) TypeScript files in src/" -ForegroundColor Green
    } else {
        Write-Host "❌ src directory missing!" -ForegroundColor Red
    }
}

# Test webpack build
Write-Host "`n📦 Testing Webpack build..." -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray

$webpackResult = npm run package 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Webpack build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Webpack build failed:" -ForegroundColor Red
    Write-Host $webpackResult -ForegroundColor Red
}

# Check output files
Write-Host "`n📁 Checking output files..." -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Gray

if (Test-Path "out/extension.js") {
    Write-Host "✅ out/extension.js created" -ForegroundColor Green
} else {
    Write-Host "⚠️  out/extension.js not found" -ForegroundColor Yellow
}

if (Test-Path "dist/extension.js") {
    Write-Host "✅ dist/extension.js created" -ForegroundColor Green
} else {
    Write-Host "⚠️  dist/extension.js not found" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n🎯 Build Fix Summary:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All build processes completed successfully!" -ForegroundColor Green
    Write-Host "🚀 BMAD VS Code Extension is ready for packaging!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build errors detected - check output above" -ForegroundColor Red
    Write-Host "💡 Try running: npm run clean-install" -ForegroundColor Yellow
}
