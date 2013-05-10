@echo off

REM Launch Ruby Compass SASS Compiler

FOR %%i IN (%RUBY%) DO SET RUBY_DIR=%%~dpi
PATH %PATH%;%RUBY_DIR%

PUSHD %~dp0

compass watch

pause

