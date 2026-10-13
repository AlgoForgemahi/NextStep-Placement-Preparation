@echo off
cd /d "%~dp0"
call npm run dev
if errorlevel 1 (
  echo.
  echo Startup failed. Read the error above.
  pause
)
