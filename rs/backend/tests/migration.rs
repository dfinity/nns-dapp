//! Test the migration of the accounts database.
use std::{env, ffi::OsStr, fs, path::PathBuf, sync::Arc, time::Duration};
use candid::{encode_one, decode_one, Principal};
use nns_dapp::{accounts_store::schema::SchemaLabel, stats::Stats};
use pocket_ic::{PocketIc, PocketIcBuilder, WasmResult};


fn args_with_schema(schema: Option<SchemaLabel>) -> Vec<u8> {
    let mut args = nns_dapp::arguments::CanisterArguments::default();
    args.schema = schema;
    encode_one(args).expect("Failed to encode arguments")

}

/// An Internet Computer with just the NNS Dapp.
struct TestEnv {
    pub pic: PocketIc,
    pub canister_id: ic_principal::Principal,
    pub controller: ic_principal::Principal,
}
impl TestEnv {
    /// Create a new test environment.
    pub fn new() -> TestEnv {
        let pic = PocketIcBuilder::new().with_nns_subnet().build();
        let nns_sub = pic.topology().get_nns().unwrap();
        let controller = ic_principal::Principal::anonymous();
        let canister_id = pic.create_canister_on_subnet(Some(controller), None, nns_sub);        
        pic.add_cycles(canister_id, 2_000_000_000_000_000);  //  Needed?
        TestEnv { pic, canister_id, controller }
    }
    /// Get the nns-dapp stats.
    pub fn get_stats(&self) -> Stats {
        let WasmResult::Reply(reply) = self.pic.query_call(self.canister_id, self.controller, "get_stats", encode_one(()).unwrap()).expect("Failed to get stats") else {
            unreachable!()
        };
        decode_one(&reply).unwrap()
    }
}

#[test]
fn migration_toy_1() {
    let test_env = TestEnv::new();
    let mut expected_num_accounts = 0;
    // Install the initial Wasm.
    {
        let wasm_bytes = fs::read("../../out/nns-dapp_test.wasm.gz").expect("Failed to read wasm file");
        test_env.pic.install_canister(test_env.canister_id, wasm_bytes.to_owned(), args_with_schema(Some(SchemaLabel::Map)), None);
    }
    // Create some accounts.
    {
        let accounts_to_add = 23u128;
        expected_num_accounts += accounts_to_add;
        test_env.pic.update_call(test_env.canister_id, test_env.controller, "create_toy_accounts", encode_one(accounts_to_add).unwrap()).expect("Failed to create toy accounts");    
        let stats = test_env.get_stats();
        assert_eq!(expected_num_accounts, u128::from(stats.accounts_count), "Number of accounts is not as expected  after creatining initial population");    
    }
}


#[test]
fn find_wasm() {
    let anonymous = ic_principal::Principal::anonymous();
    let wasm_filename = "nns-dapp_test.wasm";
    let args_filename = "nns-dapp-arg-local.did";
    let build_dir = "../../out/";
    let pic = PocketIc::new();
    let pic = PocketIcBuilder::new().with_nns_subnet().build();
    // TODO: Make this a system subnet canister.
    let canister_id = pic.create_canister();
    let nns_sub = pic.topology().get_nns().unwrap();
let canister_id = pic.create_canister_on_subnet(Some(anonymous), None, nns_sub);

    pic.add_cycles(canister_id, 2_000_000_000_000_000);
    // Note: In the examples, the wasm file is not gzipped.  Installing an unzipped nns-dapp Wasm fails as it is too large (` Message byte size 5412983 is larger than the max allowed 3670016`).
    // Experimenting with the sns aggregator as that is smaller.
    // Ok, that worked, now trying with .gz .. success.
    // Ok, trying with the nns-dapp:  Success
    let wasm_bytes = fs::read("../../out/nns-dapp_test.wasm.gz").expect("Failed to read wasm file");
    // The only example of passing  in args uses: `encode_one(payload).unwrap()`.  If I recall correctly that yields binary candid encoding, not text.
    // let arg_bytes = fs::read("../../out/nns-dapp-arg-local.bin").expect("Failed to read arg file");

    pic.install_canister(canister_id, wasm_bytes.to_owned(), args_with_schema(Some(SchemaLabel::Map)), None);
    pic.update_call(canister_id, anonymous, "create_toy_accounts", encode_one(10u128).unwrap()).expect("Failed to create toy accounts");
    let WasmResult::Reply(reply) = pic.query_call(canister_id, anonymous, "get_stats", encode_one(()).unwrap()).expect("Failed to get stats") else {
        unreachable!()
    };
    let stats: Stats = decode_one(&reply).unwrap();
    println!("Stats: {stats:?}");
    assert_eq!(10, stats.accounts_count);
    pic.upgrade_canister(canister_id, wasm_bytes, args_with_schema(Some(SchemaLabel::AccountsInStableMemory)), Some(anonymous)).expect("Upgrade failed");
    // Upgrade failed: UserError(UserError { code: CanisterInstallCodeRateLimited, description: "Canister lxzze-o7777-77777-aaaaa-cai is rate limited because it executed too many instructions in the previous install_code messages. Please retry installation after several minutes." })

    // Plan:
    // - [x] Create the arguments from rust.
    // - [x] Create accounts
    // - [x] Check accounts count is as expected
    // - [x] Upgrade to trigger a migration.
    // - [ ] Call step? Might be simpler than calling the heartbeat.  Heartbeat would be more realistic so that can be a strech goal ponce everything elese is working.
    // - [ ] Make a PR with rustdocs!
    //    - [ ] Examples of passing in wasm, gzipped or not.
    //    - [ ] Example of passing in arguments, empty, from Rust or from a binary (not text) candid file.
    //    - [ ] Tell the infra story - installing pocket-ic and building the Wasm before running the test.
    // - [x] Bonus: Run this on a system subnet.


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