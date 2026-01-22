@echo off
echo ====================================
echo Updating and Deploying RaiseHive
echo ====================================

echo.
echo [1/6] Cleaning old files...
if exist artifacts rmdir /s /q artifacts
if exist cache rmdir /s /q cache
if exist deployments mkdir deployments
echo Done!

echo.
echo [2/6] Cleaning Hardhat...
call npx hardhat clean
echo Done!

echo.
echo [3/6] Removing old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Done!

echo.
echo [4/6] Installing fresh dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Installation failed!
    pause
    exit /b %errorlevel%
)
echo Done!

echo.
echo [5/6] Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)
echo Done!

echo.
echo [6/6] Deploying to Sepolia...
call npm run deploy:sepolia
if %errorlevel% neq 0 (
    echo Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ====================================
echo SUCCESS! 
echo ====================================
echo.
echo Please check the output above for:
echo 1. Factory Contract Address
echo 2. Update your .env files with this address
echo.
pause