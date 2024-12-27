#!/bin/bash

# Get src directory path
SRC_DIR="$(dirname "$(dirname "$0")")/src"

find "$SRC_DIR" -name "*.svelte" -type f | while read -r file; do
    # Extract imports between <script> tags and find duplicates
    imports=$(sed -n '/<script/,/<\/script>/p' "$file" | grep '^[[:space:]]*import')

    # Extract and count import sources
    sources=$(echo "$imports" | sed -n "s/.*from ['\"]\\([^'\"]*\\)['\"].*/\\1/p")
    duplicates=$(echo "$sources" | sort | uniq -d)

    # Print results if duplicates found
    if [ ! -z "$duplicates" ]; then
        echo "File with duplicate imports: $file"
        echo "Duplicate sources:"
        echo "$duplicates"
        echo "---"
    fi
done
