@echo off
REM Script para instalar Leaflet
cd /d "%~dp0"
echo Instalando dependências...
npm install --no-fund
echo Instalação concluída!
pause
