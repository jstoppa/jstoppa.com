REM This script cleans the jstoppa.com repo and leaves only the main branch with a single commit.
REM It is not intended to be used on other repositories, it is specific to the jstoppa.com repository.

REM Get the name of the repository
for /f "tokens=3" %%i in ('git remote show origin ^| findstr "Fetch URL"') do set "repoName=%%i"

REM Check if the repository name matches the one to ignore
echo %repoName%
if "%repoName%"=="https://github.com/jstoppa/private.jstoppa.com.git" (
    echo This script cannot be run on the specified repository.
    exit /b
)

echo Are you sure you want to delete all branches except 'main' and keep it in a single commit? (Y/N)
set /p UserInput=Type Y to continue, N to exit: 

if /I "%UserInput%" neq "Y" (
    echo Operation cancelled by user.
    exit /b
)

SETLOCAL EnableExtensions EnableDelayedExpansion

REM Fetch latest updates from remote
git fetch --prune

REM List all branches and delete them except for main
for /f "tokens=*" %%b in ('git branch') do (
    set "branch=%%b"
    set "branch=!branch:~2!"

    REM Remove any leading or trailing spaces
    for /f "tokens=*" %%x in ("!branch!") do set "branch=%%x"

    REM Check if the branch is 'main'
    if /I not "!branch!"=="main" (
        echo Deleting branch: !branch!
        git branch -d "!branch!"
        git push origin --delete "!branch!"
    )
)
git checkout --orphan temp_branch && git add -A && git commit -m "new update %date% %time%" && git branch -D main && git branch -m main && git push -f origin main
