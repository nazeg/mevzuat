@echo off
echo ==============================================
echo KSBU Mevzuat - PocketBase Yerel Veritabani
echo ==============================================
echo.
echo Sunucu calisiyor...
echo Admin Arayuzu: http://127.0.0.1:8090/_/
echo API Sunucusu: http://127.0.0.1:8090
echo.
echo Durdurmak icin bu pencereyi kapatabilir 
echo veya Ctrl+C tuşlarına basabilirsiniz.
echo ==============================================
echo.
cd /d "%~dp0"
pocketbase\pocketbase.exe serve
