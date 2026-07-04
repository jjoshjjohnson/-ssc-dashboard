@echo off
:: SASHA — sync local files with GitHub (double-click, or run at PC startup)
cd /d "%~dp0"
echo.
echo  ============================================
echo   SASHA — syncing local files with GitHub
echo  ============================================
echo.
git fetch origin claude/new-repository-bap65s
if errorlevel 1 (
  echo  [ERROR] Could not reach GitHub. Check your internet connection.
  pause
  exit /b 1
)
git pull origin claude/new-repository-bap65s
if errorlevel 1 (
  echo.
  echo  [ERROR] Pull failed — you may have local edits that conflict.
  echo  Run "git stash" first if you want to set your local edits aside, then re-run this.
  pause
  exit /b 1
)
echo.
echo  Up to date. Latest changes:
git log --oneline -5
echo.
timeout /t 8
