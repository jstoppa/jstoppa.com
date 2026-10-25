@echo off
REM Publishes this private checkout to jstoppa.com as a single commit on main,
REM and deletes every other branch on that public repo.
REM Run it from the private.jstoppa.com checkout. One command.

setlocal EnableExtensions EnableDelayedExpansion

set "private=https://github.com/jstoppa/private.jstoppa.com.git"
set "public=https://github.com/jstoppa/jstoppa.com.git"

for /f "delims=" %%i in ('git remote get-url origin') do set "origin=%%i"
if not "%origin%"=="%private%" (
    echo Run this from the private.jstoppa.com checkout.
    exit /b 1
)

git status --porcelain | findstr "." >nul
if not errorlevel 1 (
    echo Commit or stash your changes first. Nothing was published.
    exit /b 1
)

echo Pushing this repo and the submodule commits it points at.
git push --recurse-submodules=on-demand origin HEAD
if errorlevel 1 exit /b 1

for /f "delims=" %%t in ('git rev-parse "HEAD^^{tree}"') do set "tree=%%t"
for /f "delims=" %%c in ('git commit-tree %tree% -m "new update %date% %time%"') do set "commit=%%c"

echo Publishing %commit% as the only commit on jstoppa.com main.
git push -f %public% %commit%:refs/heads/main
if errorlevel 1 exit /b 1

for /f "tokens=2" %%r in ('git ls-remote --heads %public%') do (
    set "ref=%%r"
    set "name=!ref:refs/heads/=!"
    if /I not "!name!"=="main" (
        echo Deleting public branch !name!.
        git push %public% --delete !name!
        if errorlevel 1 exit /b 1
    )
)

echo Published %commit%. jstoppa.com has only main.
exit /b 0
