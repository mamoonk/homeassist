@echo off
setlocal
title Gloss Smart Dashboard
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js not found. Install it from https://nodejs.org and try again.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo npm install failed.
        pause
        exit /b 1
    )
)

echo Starting dev server at http://localhost:5173 ...
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:5173"
call npm run dev
