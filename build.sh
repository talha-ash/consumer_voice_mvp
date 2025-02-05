#!/usr/bin/env bash
# exit on error
set -o errexit

rm -rf _build
# Initial setup
mix deps.get --only prod
mix compile

# Compile assets
# Make sure tailwind and esbuild are installed
# MIX_ENV=prod mix assets.build
# Build minified assets
 mix assets.deploy

# Create server script, Build the release, and overwrite the existing release directory
 mix phx.gen.release
 mix release
