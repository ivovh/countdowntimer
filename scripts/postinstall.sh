#!/usr/bin/env bash
rm -rf public/* && mkdir -p public && cp -r src/* public && webpack
