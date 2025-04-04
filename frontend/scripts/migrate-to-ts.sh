#!/bin/bash

# Function to convert JSX to TSX with proper types
convert_jsx_to_tsx() {
  local file=$1
  local dir=$(dirname "$file")
  local name=$(basename "$file" .jsx)
  local tsx_file="$dir/$name.tsx"

  echo "Converting $file to $tsx_file"

  # Add TypeScript imports and type definitions
  cat "$file" | sed \
    -e '1s/^/import React from '\''react'\'';\n/' \
    -e 's/export const \([A-Za-z0-9_]\+\) =/export const \1: React.FC =/' \
    -e 's/export function \([A-Za-z0-9_]\+\)(/export function \1: React.FC(/' \
    -e 's/export default function \([A-Za-z0-9_]\+\)(/export default function \1: React.FC(/' \
    -e 's/export default const \([A-Za-z0-9_]\+\) =/export default const \1: React.FC =/' \
    -e 's/useState(/useState<Type>(/' \
    -e 's/onClick={\([^}]*\)}/onClick={(e: React.MouseEvent<HTMLButtonElement>) => \1}/' \
    -e 's/onChange={\([^}]*\)}/onChange={(e: React.ChangeEvent<HTMLInputElement>) => \1}/' \
    -e 's/onSubmit={\([^}]*\)}/onSubmit={(e: React.FormEvent<HTMLFormElement>) => \1}/' \
    > "$tsx_file"

  # Remove the original JSX file
  rm "$file"
}

# Function to convert JS to TS
convert_js_to_ts() {
  local file=$1
  local dir=$(dirname "$file")
  local name=$(basename "$file" .js)
  local ts_file="$dir/$name.ts"

  echo "Converting $file to $ts_file"
  cp "$file" "$ts_file"
  rm "$file"
}

# Convert all JSX files
find src -name "*.jsx" -type f | while read file; do
  convert_jsx_to_tsx "$file"
done

# Convert all JS files (excluding JSX)
find src -name "*.js" -type f | while read file; do
  if [[ "$file" != *.jsx ]]; then
    convert_js_to_ts "$file"
  fi
done

# Install necessary TypeScript type definitions
echo "Installing TypeScript type definitions..."
npm install --save-dev @types/react @types/react-dom @types/node

# Run type checking
echo "Running type checking..."
npx tsc --noEmit

echo "Migration complete!" 