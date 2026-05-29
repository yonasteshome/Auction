@echo off
REM Copy the SpendSense folder into this Auction folder as Auction\SpendSense
set SRC=%~dp0..\SpendSense
set DEST=%~dp0SpendSense
if not exist "%SRC%" (
  echo Source folder not found: %SRC%
  exit /b 1
)
if exist "%DEST%" (
  echo Destination already exists: %DEST%
  exit /b 0
)
mkdir "%DEST%"
xcopy "%SRC%\*" "%DEST%\" /E /I /Y
echo Copied SpendSense into Auction\SpendSense
