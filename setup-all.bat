@echo off
echo ================================================================
echo           RAISEHIVE - COMPLETE SETUP SCRIPT
echo ================================================================

echo.
echo [1/5] Setting up Blockchain...
cd blockchain
if not exist node_modules (
    echo Installing blockchain dependencies...
    call npm install
)
echo Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ❌ Blockchain compilation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/5] Setting up Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
if not exist contracts mkdir contracts
echo Copying contract ABIs...
call node scripts/copy-contracts.js
cd ..

echo.
echo [3/5] Copying contracts to Frontend...
if not exist frontend\src\contracts mkdir frontend\src\contracts
xcopy /Y /I blockchain\artifacts\contracts\CrowdfundingFactory.sol\CrowdfundingFactory.json frontend\src\contracts\
xcopy /Y /I blockchain\artifacts\contracts\Campaign.sol\Campaign.json frontend\src\contracts\
echo ✅ Contracts copied to frontend

echo.
echo [4/5] Setting up Frontend...
cd frontend
if exist node_modules (
    echo Cleaning old dependencies...
    rmdir /s /q node_modules
    del package-lock.json
)
echo Installing frontend dependencies with legacy peer deps...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [5/5] Verifying setup...
echo Checking backend contracts...
if exist backend\contracts\CrowdfundingFactory.json (
    echo ✅ Backend contracts OK
) else (
    echo ❌ Backend contracts missing
)

echo Checking frontend contracts...
if exist frontend\src\contracts\CrowdfundingFactory.json (
    echo ✅ Frontend contracts OK
) else (
    echo ❌ Frontend contracts missing
)

echo.
echo ================================================================
echo                    SETUP COMPLETE! ✨
echo ================================================================
echo.
echo 📝 IMPORTANT: Update your .env files!
echo.
echo Backend (.env):
echo   - MONGODB_URI
echo   - JWT_SECRET
echo   - ETHEREUM_RPC_URL
echo   - FACTORY_CONTRACT_ADDRESS
echo   - EMAIL credentials
echo.
echo Frontend (.env):
echo   - VITE_API_URL
echo   - VITE_FACTORY_CONTRACT_ADDRESS
echo   - VITE_THIRDWEB_CLIENT_ID
echo.
echo Next steps:
echo 1. Get Sepolia ETH from: https://sepoliafaucet.com/
echo 2. Deploy contracts: cd blockchain ^&^& npm run deploy:sepolia
echo 3. Update .env files with contract address
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
pause