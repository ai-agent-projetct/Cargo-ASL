@echo off
cd /d "%~dp0"
"E:\Tools\OmniRoute\node-v24.21.0-win-x64\node.exe" scripts\start.mjs
if errorlevel 1 pause
