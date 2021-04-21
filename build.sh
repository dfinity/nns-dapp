./generate-wasm.sh nns_ui

cd js-agent
./build.sh
cd ..

cd dfinity_wallet
flutter build web --web-renderer canvaskit --release --no-sound-null-safety
