@echo off&chcp 65001&cd /d %~dp0&cls

@REM cd /d %USERPROFILE%\AppData\Local\Android\Sdk\emulator
@REM start emulator.exe -avd AppleMusicAndroid -snapshot-list -no-boot-anim
@REM cd /d %~dp0
@REM pause

adb disconnect
timeout /t 5
adb push frida-server /data/local/tmp
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server"
adb disconnect
pause
