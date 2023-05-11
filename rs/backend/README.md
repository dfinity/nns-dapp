## Chunked upload
* Create a normal build
```
./scripts/docker-build --network local
```
* Chunk the assets
```
./scripts/nns-dapp/split-assets
```
* get the sha256 sums of the chunks:
```
sha256sum out/chunks/*
acaa46b184297235544a729a405572286137ef1ee33a854de1e20fa30024a2bb  out/chunks/assets.xaa.tar.xz
0f9c5e58fdc75f403f7872c6db955147e7a638f07d9c0fcf25d6995813eda257  out/chunks/assets.xab.tar.xz
```
* Add the shasums to the whitelist in `src/main.rs` `fn add_assets_tar_xz`
* Build again:
```
./scripts/docker-build --network local
```
* Note that the docker build output includes a small wasm with no assets:
```
$ ls -lH out/nns-dapp_noassets.wasm 
-rw-r--r-- 1 max max 837333 Mai 11 06:31 out/nns-dapp_noassets.wasm
```
* Deploy the nns-dapp with the small wasm:
```
dfx start
dfx canister create nns-dapp
dfx canister install nns-dapp --wasm ./out/nns-dapp_noassets.wasm --argument "$(cat ./out/nns-dapp-arg-local.did)"
```
* Upload the chunks:
```
max@sinkpad:~/dfn/nns-dapp/branches/upload-assets (29:59)$ ./scripts/nns-dapp/asset-chunk-upload -c out/chunks/assets.xaa.tar.xz
()
max@sinkpad:~/dfn/nns-dapp/branches/upload-assets (30:19)$ ./scripts/nns-dapp/asset-chunk-upload -c out/chunks/assets.xab.tar.xz
()
```
(Yes, the response could be nicer)
