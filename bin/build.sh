#!/usr/bin/env bash

set -e

# Set variables.
PREFIX="refs/tags/"
VERSION=${1#"$PREFIX"}

echo "Building Package v${VERSION}..."

# Change version string.
sed -i.bak 's/"type": "commonjs",/"type": "module",/g' package.json
sed -i.bak "s/\"version\": .*,$/\"version\": \"${VERSION}\",/g" package.json
rm package.json.bak
