//! Test the migration of the accounts database.
use std::{env, ffi::OsStr, fs, path::PathBuf};
use pocket_ic::PocketIc;


#[test]
fn find_wasm() {
    let wasm_filename = "nns-dapp_test.wasm";
    let args_filename = "nns-dapp-arg-local.did";
    let build_dir = "../../out/";
    let pic = PocketIc::new();
    // TODO: Make this a system subnet canister.
    let canister_id = pic.create_canister();
    pic.add_cycles(canister_id, 2_000_000_000_000);
    // Note: In the examples, the wasm file is not gzipped.  Installing an unzipped nns-dapp Wasm fails as it is too large (` Message byte size 5412983 is larger than the max allowed 3670016`).
    // Experimenting with the sns aggregator as that is smaller.
    // Ok, that worked, now trying with .gz .. success.
    // Ok, trying with the nns-dapp:  Success
    let wasm_bytes = fs::read("../../out/nns-dapp_test.wasm.gz").expect("Failed to read wasm file");
    // The only example of passing  in args uses: `encode_one(payload).unwrap()`.  If I recall correctly that yields binary candid encoding, not text.
    let arg_bytes = fs::read("../../out/nns-dapp-arg-local.bin").expect("Failed to read arg file");
    println!("Wasm len: {}", wasm_bytes.len());
    pic.install_canister(canister_id, wasm_bytes, arg_bytes, None);

    let build_dir = Some(OsStr::new("../../out/"))
         .map(PathBuf::from).expect("Cargo is meant to set that....");
    fs::read_dir(build_dir).expect("Failed to read dir")
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        //.filter(|path| path.extension().map(|ext| ext == "wasm").unwrap_or(false))
        .for_each(|path| {
            println!("Found wasm file: {:?}", path);
        });
}