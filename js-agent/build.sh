npm install
tsc
npx browserify ./build/index.js --standalone DfinityAgent > ../dfinity_wallet/assets/dfinity_agent.js
