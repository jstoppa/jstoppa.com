#!/bin/bash
# Publishes this private checkout to jstoppa.com as a single commit on main,
# and deletes every other branch on that public repo.
# Run it from the private.jstoppa.com checkout. One command.

set -euo pipefail

private="https://github.com/jstoppa/private.jstoppa.com.git"
public="https://github.com/jstoppa/jstoppa.com.git"
origin=$(git remote get-url origin)

if [ "$origin" != "$private" ]; then
    echo "Run this from the private.jstoppa.com checkout."
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "Commit or stash your changes first. Nothing was published."
    exit 1
fi

echo "Pushing this repo and the submodule commits it points at."
git push --recurse-submodules=on-demand origin HEAD

tree=$(git rev-parse "HEAD^{tree}")
commit=$(git commit-tree "$tree" -m "new update $(date)")

echo "Publishing ${commit} as the only commit on jstoppa.com main."
git push -f "$public" "${commit}:refs/heads/main"

while read -r _ ref; do
    name=${ref#refs/heads/}
    if [ -n "$name" ] && [ "$name" != "main" ]; then
        echo "Deleting public branch ${name}."
        git push "$public" --delete "$name"
    fi
done < <(git ls-remote --heads "$public")

echo "Published ${commit}. jstoppa.com has only main."
