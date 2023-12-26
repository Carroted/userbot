# Simple script that tsups to a dist in the test folder and runs it for you!
#/bin/bash

echo "Building test '$1'..."

# store a filename based on $2, if it doesnt exist, use index.js
filename="index"
if [ -n "$2" ]; then
  filename="$2"
fi

# npx for compatibility, not everyone has pnpm
npx tsup tests/$1/$filename.ts --outDir "tests/$1/dist" --minify --silent --format esm --sourcemap

echo "Build complete! Running test '$1'..."

node --enable-source-maps tests/$1/dist/$filename.js