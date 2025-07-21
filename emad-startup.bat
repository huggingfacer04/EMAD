@echo off
REM EMAD Auto-Start Script
REM This script can be placed in Windows Startup folder to automatically start EMAD

REM Change to the EMAD directory
cd /d "C:\Users\Lenovo ThinkPad T480\Desktop\BMAD\BMAD-METHOD"

REM Wait a bit for system to fully boot
timeout /t 30 /nobreak >nul

REM Start EMAD Background Runner
python emad-background-runner.py start

REM Optional: Show a notification that EMAD started
echo EMAD Auto-Sync started successfully > "%TEMP%\emad-startup.log"
