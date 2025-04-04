#!/bin/bash

# Convert all JSX files to TSX
find src -name "*.jsx" -type f | while read file; do
  # Get the directory and filename without extension
  dir=$(dirname "$file")
  name=$(basename "$file" .jsx)
  
  # Create the new TSX file
  tsx_file="$dir/$name.tsx"
  
  # Add TypeScript imports and type definitions
  echo "Converting $file to $tsx_file"
  
  # Copy the file and add TypeScript types
  cat "$file" | sed -e '1s/^/import React from '\''react'\'';\n/' \
    -e 's/export const \([A-Za-z0-9_]\+\) =/export const \1: React.FC =/' \
    -e 's/export function \([A-Za-z0-9_]\+\)(/export function \1: React.FC(/' \
    -e 's/export default function \([A-Za-z0-9_]\+\)(/export default function \1: React.FC(/' \
    -e 's/export default const \([A-Za-z0-9_]\+\) =/export default const \1: React.FC =/' \
    > "$tsx_file"
  
  # Remove the original JSX file
  rm "$file"
done

# Convert all JS files to TS
find src -name "*.js" -type f | while read file; do
  # Skip if it's a JSX file
  if [[ "$file" != *.jsx ]]; then
    # Get the directory and filename without extension
    dir=$(dirname "$file")
    name=$(basename "$file" .js)
    
    # Create the new TS file
    ts_file="$dir/$name.ts"
    
    # Copy the file
    echo "Converting $file to $ts_file"
    cp "$file" "$ts_file"
    
    # Remove the original JS file
    rm "$file"
  fi
done

echo "Conversion complete!" 