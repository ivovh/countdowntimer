#!/usr/bin/env bash
rm -rf public/* && mkdir -p public && cp -r src/* public && cp -r src/.well* public && webpack
