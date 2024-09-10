@echo off
setlocal

REM Define variables to hold the results of passed and failed tests
set django_passed=0
set django_failed=0
set react_passed=0
set react_failed=0

REM Navigate to the backend directory and run Django tests
echo Running Django backend tests...
cd backend
python manage.py test > ..\django_test_output.txt

REM Parse Django test output for pass/fail counts
for /f "tokens=2 delims= " %%a in ('findstr /c:"OK" ..\django_test_output.txt') do (
    set django_passed=%%a
)

for /f "tokens=2 delims= " %%a in ('findstr /c:"FAIL" ..\django_test_output.txt') do (
    set django_failed=%%a
)

REM Navigate back to root directory and then to the frontend directory
cd ..\my-pokemon-app

REM Run React frontend tests
echo Running React frontend tests...
REM Start the tests in a separate process to avoid keeping it open
npm test > ..\react_test_output.txt

REM Kill the npm process after test run
taskkill /f /im node.exe >nul 2>&1

REM Parse React test output for pass/fail counts
for /f "tokens=2 delims= " %%a in ('findstr /c:"Test Suites: .* passed" ..\react_test_output.txt') do (
    set react_passed=%%a
)

for /f "tokens=2 delims= " %%a in ('findstr /c:"Test Suites: .* failed" ..\react_test_output.txt') do (
    set react_failed=%%a
)

REM Display the summary of passed and failed tests at the end
echo.
echo ==============================
echo Test Summary:
echo ==============================
echo Django backend tests:
echo Passed: %django_passed%
echo Failed: %django_failed%
echo ------------------------------
echo React frontend tests:
echo Passed: %react_passed%
echo Failed: %react_failed%
echo ==============================

REM If any tests failed, display the surrounding console output for failed tests

if %django_failed% neq 0 (
    echo Django backend tests failed.
    echo Displaying failed test output...
    echo ------------------------------
    REM Show console output for failed Django tests
    findstr /c:"FAIL" ..\django_test_output.txt
    echo ------------------------------
)

if %react_failed% neq 0 (
    echo React frontend tests failed.
    echo Displaying failed test output...
    echo ------------------------------
    REM Show surrounding console output for failed React tests
    findstr /c:"FAIL" ..\react_test_output.txt
    echo ------------------------------
)

endlocal
exit /b 0
