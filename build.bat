@echo off
echo Building Colin's Building Services Website Configuration...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ to use the build system
    pause
    exit /b 1
)

REM Run the configuration compiler
python build-config.py %*

if errorlevel 1 (
    echo.
    echo Build failed! Check the error messages above.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo The compiled configuration is now available for improved performance.
echo.

REM If no arguments provided, show usage
if "%1"=="" (
    echo Usage:
    echo   build.bat           - Compile once
    echo   build.bat --dev     - Compile with debug info
    echo   build.bat --watch   - Watch for changes and auto-rebuild
    echo.
)

pause