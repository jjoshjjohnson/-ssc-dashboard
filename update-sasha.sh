#!/usr/bin/env bash
# SASHA — sync local files with GitHub (run manually or at login)
cd "$(dirname "$0")" || exit 1
echo "============================================"
echo " SASHA — syncing local files with GitHub"
echo "============================================"
if ! git pull origin claude/new-repository-bap65s; then
  echo "[ERROR] Pull failed — check connection, or run 'git stash' if local edits conflict."
  exit 1
fi
echo
echo "Up to date. Latest changes:"
git log --oneline -5
