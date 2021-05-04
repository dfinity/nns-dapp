#!/usr/bin/env bash

# install node dependencies
npm install

# compilation of flutter app and agent
npx tsc
npx browserify ./build/index.js --standalone DfinityAgent > ../dfinity_wallet/assets/dfinity_agent.js