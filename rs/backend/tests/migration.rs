//! Tests the migration of the accounts database.
//!
//! Assumes that the NNS Dapp Wasm has already been compiled and is available in the `out/` directory in the repository root.
use candid::{decode_one, encode_one};
use nns_dapp::{accounts_store::schema::SchemaLabel, arguments::CanisterArguments, stats::Stats};
use pocket_ic::{PocketIc, PocketIcBuilder, WasmResult};
use proptest::prelude::*;
use std::fs;
use strum_macros::EnumIter;

fn args_with_schema(schema: Option<SchemaLabel>) -> Vec<u8> {
    let mut args = nns_dapp::arguments::CanisterArguments::default();
    args.schema = schema;
    encode_one(args).expect("Failed to encode arguments")
}

/// Data that should be unaffected by migration.
#[derive(Debug, Eq, PartialEq)]
struct InvariantStats {
    pub num_accounts: u64,
    // TODO: Are there any more invariants that should be checked?
}

/// An Internet Computer with two NNS dapps, one to migrate and one as a reference.
///
/// - Accounts are created in both canisters.
/// - Migrations and rollbacks are applied only to the main (non-reference) canister.
/// - The two canisters should always have the same accounts.
struct TestEnv {
    pic: PocketIc,
    pub canister_id: ic_principal::Principal,
    pub reference_canister_id: ic_principal::Principal,
    pub controller: ic_principal::Principal,
}
impl TestEnv {
    /// Path to the Wasm
    const WASM_PATH: &'static str = "../../out/nns-dapp_test.wasm.gz";
    /// Creates a new test environment.
    pub fn new() -> TestEnv {
        let pic = PocketIcBuilder::new().with_nns_subnet().build();
        let nns_sub = pic.topology().get_nns().unwrap();
        let controller = ic_principal::Principal::anonymous();
        let canister_id = pic.create_canister_on_subnet(Some(controller), None, nns_sub);
        let reference_canister_id = pic.create_canister_on_subnet(Some(controller), None, nns_sub);
        TestEnv {
            pic,
            canister_id,
            reference_canister_id,
            controller,
        }
    }
    /// Installs the Wasm with a given schema.
    ///
    /// The reference canister is installed with the default schema.
    pub fn install_wasm_with_schema(&self, schema: Option<SchemaLabel>) {
        let wasm_bytes = fs::read(Self::WASM_PATH).expect("Failed to read wasm file");
        self.pic.install_canister(
            self.canister_id,
            wasm_bytes.to_owned(),
            args_with_schema(schema),
            Some(self.controller),
        );
        self.pic.install_canister(
            self.reference_canister_id,
            wasm_bytes.to_owned(),
            encode_one(CanisterArguments::default()).unwrap(),
            Some(self.controller),
        );
    }
    /// Upgrades the canister to a given schema.
    pub fn upgrade_to_schema(&self, schema: Option<SchemaLabel>) {
        let wasm_bytes = fs::read(Self::WASM_PATH).expect("Failed to read wasm file");
        self.pic
            .stop_canister(self.canister_id, Some(self.controller))
            .expect("Failed to stop canister pre-upgrade");
        self.pic
            .upgrade_canister(
                self.canister_id,
                wasm_bytes,
                args_with_schema(schema),
                Some(self.controller),
            )
            .expect("Upgrade failed");
        self.pic
            .start_canister(self.canister_id, Some(self.controller))
            .expect("Failed to start canister post-upgrade");
    }
    /// Gets stats from a given canister.
    fn get_stats_from_canister(&self, canister_id: ic_principal::Principal) -> Stats {
        let WasmResult::Reply(reply) = self
            .pic
            .query_call(canister_id, self.controller, "get_stats", encode_one(()).unwrap())
            .expect("Failed to get stats")
        else {
            unreachable!()
        };
        decode_one(&reply).unwrap()
    }
    /// Gets stats from the main canister.
    pub fn get_stats(&self) -> Stats {
        self.get_stats_from_canister(self.canister_id)
    }
    /// Gets the invariants from either the main or the reference canister.
    fn get_invariants_from_canister(&self, canister_id: ic_principal::Principal) -> InvariantStats {
        let stats: Stats = self.get_stats_from_canister(canister_id);
        InvariantStats {
            num_accounts: u64::from(stats.accounts_count),
        }
    }
    /// Asserts that the number of accounts is as expected.
    pub fn assert_invariants_match(&self) {
        let expected = self.get_invariants_from_canister(self.reference_canister_id);
        let actual = self.get_invariants_from_canister(self.canister_id);
        assert_eq!(
            expected, actual,
            "Account stats do not match for the main and reference canisters"
        );
    }
    /// Creates accounts in the main and reference canisters.
    pub fn create_toy_accounts(&self, num_accounts: u128) {
        for canister_id in &[self.canister_id, self.reference_canister_id] {
            self.pic
                .update_call(
                    *canister_id,
                    self.controller,
                    "create_toy_accounts",
                    encode_one(num_accounts).unwrap(),
                )
                .expect("Failed to create toy accounts");
        }
    }
    /// Applies an arbitrary operation.
    pub fn perform(&self, operation: Operation) {
        match operation {
            Operation::CreateToyAccounts(num_accounts) => self.create_toy_accounts(u128::from(num_accounts)),
            Operation::UpgradeToMap => self.upgrade_to_schema(Some(SchemaLabel::Map)),
            Operation::UpgradeToStableStructures => self.upgrade_to_schema(Some(SchemaLabel::AccountsInStableMemory)),
            Operation::Tick(ticks) => {
                for _ in 0..ticks {
                    self.pic.tick();
                }
            }
        }
    }
}

/// Operations that can be applied to an nns-dapp as part of randomized testing.
///
/// Note: u8 is used for some variants, rather than the larger types supported by the actual API, to keep the test runtime reasonable.
#[derive(Debug, Eq, PartialEq, EnumIter, Copy, Clone)]
enum Operation {
    UpgradeToMap,
    UpgradeToStableStructures,
    Tick(u8),
    CreateToyAccounts(u8),
    // TODO: Modify a random account
    // TODO: Delete a random account
}

/// A strategy by which Proptest can choose operations.
fn operation_strategy() -> impl Strategy<Value = Operation> {
    prop_oneof![
        Just(Operation::UpgradeToMap),
        Just(Operation::UpgradeToStableStructures),
        (0..100u8).prop_map(Operation::CreateToyAccounts),
        (0..100u8).prop_map(Operation::Tick),
    ]
}
/// A strategy by which Proptest can choose a sequence of operations.
fn operation_sequence_strategy() -> impl Strategy<Value = Vec<Operation>> {
    prop::collection::vec(operation_strategy(), 1..20)
}
/// A strategy to select a schema label.
fn schema_label_strategy() -> impl Strategy<Value = SchemaLabel> {
    prop_oneof![Just(SchemaLabel::Map), Just(SchemaLabel::AccountsInStableMemory),]
}
