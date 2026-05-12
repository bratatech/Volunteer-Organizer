@echo off
echo ========================================
echo College Fest Management System Setup
echo ========================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Open TWO terminal windows
echo.
echo 2. In Terminal 1 (Backend):
echo    cd backend
echo    npm start
echo.
echo 3. In Terminal 2 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser: http://localhost:3000
echo.
echo ========================================
pause
