#!/bin/bash
# This script cleans the jstoppa.com repo and leaves only the main branch with a single commit.
# It is not intended to be used on other repositories, it is specific to the jstoppa.com repository.

# Get the name of the repository
repoName=$(git remote show origin | grep "Fetch URL" | awk '{print $3}')

# Check if the repository name matches the one to ignore
echo "$repoName"
if [ "$repoName" = "https://github.com/jstoppa/private.jstoppa.com.git" ]; then
    echo "This script cannot be run on the specified repository."
    exit 1
fi

echo "Are you sure you want to delete all branches except 'main' and keep it in a single commit? (Y/N)"
read -p "Type Y to continue, N to exit: " UserInput

# Case-insensitive comparison
if [ "$(echo "$UserInput" | tr '[:lower:]' '[:upper:]')" != "Y" ]; then
    echo "Operation cancelled by user."
    exit 0
fi

# Fetch latest updates from remote
git fetch --prune

# List all branches and delete them except for main
git branch | grep -v "main" | while read branch; do
    # Remove leading spaces and asterisk
    branch=$(echo "$branch" | sed 's/^[* ]*//')

    if [ -n "$branch" ]; then
        echo "Deleting branch: $branch"
        git branch -d "$branch"
        git push origin --delete "$branch" 2>/dev/null || true
    fi
done

git checkout --orphan temp_branch && \
git add -A && \
git commit -m "new update $(date)" && \
git branch -D main && \
git branch -m main && \
git push -f origin main
