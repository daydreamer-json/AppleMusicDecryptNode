@echo off&chcp 65001&cd /d %~dp0&cls

adb disconnect
adb push frida-server /data/local/tmp
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server"
adb disconnect
pause
