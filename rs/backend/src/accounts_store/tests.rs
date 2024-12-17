use super::histogram::AccountsStoreHistogram;
use super::*;
use crate::accounts_store::toy_data::{toy_account, ToyAccountSize};
use icp_ledger::Tokens;
use pretty_assertions::assert_eq;
use std::str::FromStr;

const TEST_ACCOUNT_1: &str = "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe";
const TEST_ACCOUNT_2: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
const TEST_ACCOUNT_3: &str = "347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe";
const TEST_ACCOUNT_4: &str = "zrmyx-sbrcv-rod5f-xyd6k-letwb-tukpj-edhrc-sqash-lddmc-7qypw-yqe";
const TEST_ACCOUNT_5: &str = "2fzwl-cu3hl-bawo2-idwrw-7yygk-uccms-cbo3a-c6kqt-lnk3j-mewg3-hae";
const TEST_ACCOUNT_6: &str = "4gb44-uya57-c2v6u-fcz5v-qrpwl-wqkmf-o3fd3-esjio-kpysm-r5xxh-fqe";

#[test]
fn create_sub_account() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    store.create_sub_account(principal, "AAA".to_string());
    store.create_sub_account(principal, "BBB".to_string());
    store.create_sub_account(principal, "CCC".to_string());

    let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

    assert_eq!(3, sub_accounts.len());
    assert_eq!("AAA", sub_accounts[0].name);
    assert_eq!("BBB", sub_accounts[1].name);
    assert_eq!("CCC", sub_accounts[2].name);
}

#[test]
fn rename_sub_account() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    store.create_sub_account(principal, "AAA".to_string());
    store.create_sub_account(principal, "BBB".to_string());
    store.create_sub_account(principal, "CCC".to_string());

    let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

    let result = store.rename_sub_account(
        principal,
        RenameSubAccountRequest {
            account_identifier: sub_accounts[1].account_identifier,
            new_name: "BBB123".to_string(),
        },
    );

    assert!(matches!(result, RenameSubAccountResponse::Ok));

    let sub_accounts = store.get_account(principal).unwrap().sub_accounts;

    assert_eq!("BBB123".to_string(), sub_accounts[1].name);
}

#[test]
fn register_hardware_wallet() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw2,
        },
    );

    assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
    assert!(matches!(res2, RegisterHardwareWalletResponse::Ok));

    let account = store.get_account(principal).unwrap();

    assert_eq!(2, account.hardware_wallet_accounts.len());
    assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
    assert_eq!("HW2", account.hardware_wallet_accounts[1].name);
    assert_eq!(
        AccountIdentifier::from(hw1),
        account.hardware_wallet_accounts[0].account_identifier
    );
    assert_eq!(
        AccountIdentifier::from(hw2),
        account.hardware_wallet_accounts[1].account_identifier
    );
}

#[test]
fn register_hardware_wallet_hardware_wallet_already_registered() {
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let mut store = setup_test_store();

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw1,
        },
    );

    assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
    assert!(matches!(
        res2,
        RegisterHardwareWalletResponse::HardwareWalletAlreadyRegistered
    ));

    let account = store.get_account(principal).unwrap();

    assert_eq!(1, account.hardware_wallet_accounts.len());
    assert_eq!("HW1", account.hardware_wallet_accounts[0].name);
    assert_eq!(
        AccountIdentifier::from(hw1),
        account.hardware_wallet_accounts[0].account_identifier
    );
}

#[test]
fn attach_canister_followed_by_get_canisters() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_ids: Vec<_> = [
        TEST_ACCOUNT_2,
        TEST_ACCOUNT_3,
        TEST_ACCOUNT_4,
        TEST_ACCOUNT_5,
        TEST_ACCOUNT_6,
    ]
    .iter()
    .map(|&id| CanisterId::from_str(id).unwrap())
    .collect();

    for (index, canister_id) in canister_ids.iter().enumerate() {
        let result = store.attach_canister(
            principal,
            AttachCanisterRequest {
                name: index.to_string(),
                canister_id: *canister_id,
            },
        );

        assert!(matches!(result, AttachCanisterResponse::Ok));
    }

    let canisters = store.get_canisters(principal);

    let expected: Vec<_> = canister_ids
        .into_iter()
        .enumerate()
        .map(|(index, canister_id)| NamedCanister {
            name: index.to_string(),
            canister_id,
        })
        .collect();

    assert_eq!(expected.len(), canisters.len());
    for i in 0..canisters.len() {
        assert_eq!(expected[i], canisters[i]);
    }
}

#[test]
fn attach_canister_name_already_taken() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::NameAlreadyTaken));
}

#[test]
fn attach_canister_name_too_long() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWX".to_string(),
            canister_id: canister_id1,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::NameTooLong));
}

#[test]
fn attach_canister_account_not_found() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let result = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id,
        },
    );

    assert!(matches!(result, AttachCanisterResponse::AccountNotFound));
}

#[test]
fn attach_canister_canister_already_attached() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let result1 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id,
        },
    );
    let result2 = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id,
        },
    );

    assert!(matches!(result1, AttachCanisterResponse::Ok));
    assert!(matches!(result2, AttachCanisterResponse::CanisterAlreadyAttached));
}

#[test]
fn attach_canister_substitutes_empty_name_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id,
        },
    );

    let initial_canisters = store.get_canisters(principal);
    assert!(initial_canisters[0].name.is_empty());

    let name = "XYZ";
    let result = store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.to_string(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(name, canisters[0].name);
    assert!(matches!(result, AttachCanisterResponse::Ok));
}

#[test]
fn attach_newly_created_canister_attaches_if_not_present() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let canisters = store.get_canisters(principal);
    assert_eq!(canisters.len(), 0);

    store.attach_newly_created_canister(principal, canister_id);

    let final_canisters = store.get_canisters(principal);
    assert_eq!(final_canisters.len(), 1);
}

#[test]
fn attach_newly_created_canister_does_not_attach_if_present() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let name = "XYZ";
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.to_string(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(canisters.len(), 1);

    store.attach_newly_created_canister(principal, canister_id);

    let final_canisters = store.get_canisters(principal);
    assert_eq!(final_canisters.len(), 1);
    assert_eq!(final_canisters[0].name, name);
}

#[test]
fn attach_canister_and_rename() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let initial_name = "ABC".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: initial_name.clone(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(initial_name, canisters[0].name);

    let final_name = "DEF".to_string();
    store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: final_name.clone(),
            canister_id,
        },
    );

    let canisters = store.get_canisters(principal);
    assert_eq!(final_name, canisters[0].name);
}

#[test]
fn rename_to_taken_name_fails() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    let name1 = "ABC".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name1.clone(),
            canister_id,
        },
    );
    let name2 = "DEF".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name2.clone(),
            canister_id: canister_id2,
        },
    );
    let canisters = store.get_canisters(principal);
    assert_eq!(name1, canisters[0].name);
    assert_eq!(name2, canisters[1].name);

    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: name1.clone(),
            canister_id: canister_id2,
        },
    );

    assert!(matches!(response, RenameCanisterResponse::NameAlreadyTaken));

    let canisters = store.get_canisters(principal);
    assert_eq!(name1, canisters[0].name);
    assert_eq!(name2, canisters[1].name);
}

#[test]
fn rename_to_long_name_fails() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    let long_name = "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string();
    let name = "DEF".to_string();
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: name.clone(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: long_name,
            canister_id,
        },
    );
    let canisters = store.get_canisters(principal);
    assert_eq!(name, canisters[0].name);
    assert!(matches!(response, RenameCanisterResponse::NameTooLong));
}

#[test]
fn rename_not_found_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "DEF".to_string(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal,
        RenameCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );
    assert!(matches!(response, RenameCanisterResponse::CanisterNotFound));
}

#[test]
fn rename_not_found_account() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();

    let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "DEF".to_string(),
            canister_id,
        },
    );
    let response = store.rename_canister(
        principal2,
        RenameCanisterRequest {
            name: "ABC".to_string(),
            canister_id,
        },
    );
    assert!(matches!(response, RenameCanisterResponse::AccountNotFound));
}

#[test]
fn canisters_ordered_by_name_if_exists_then_by_id() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();
    let canister_id3 = CanisterId::from_str(TEST_ACCOUNT_4).unwrap();
    let canister_id4 = CanisterId::from_str(TEST_ACCOUNT_5).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id: canister_id1,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id2,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id: canister_id3,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "".to_string(),
            canister_id: canister_id4,
        },
    );

    let canisters = store.get_canisters(principal);

    assert_eq!(4, canisters.len());
    assert_eq!(canister_id2, canisters[0].canister_id);
    assert_eq!(canister_id3, canisters[1].canister_id);
    assert_eq!(canister_id4, canisters[2].canister_id);
    assert_eq!(canister_id1, canisters[3].canister_id);
}

#[test]
fn detach_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );
    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "XYZ".to_string(),
            canister_id: canister_id2,
        },
    );

    let result = store.detach_canister(
        principal,
        DetachCanisterRequest {
            canister_id: canister_id1,
        },
    );

    assert!(matches!(result, DetachCanisterResponse::Ok));

    let canisters = store.get_canisters(principal);

    assert_eq!(1, canisters.len());
    assert_eq!(canister_id2, canisters[0].canister_id);
}

#[test]
fn detach_canister_canister_not_found() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
    let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

    store.attach_canister(
        principal,
        AttachCanisterRequest {
            name: "ABC".to_string(),
            canister_id: canister_id1,
        },
    );

    let result = store.detach_canister(
        principal,
        DetachCanisterRequest {
            canister_id: canister_id2,
        },
    );

    assert!(matches!(result, DetachCanisterResponse::CanisterNotFound));

    let canisters = store.get_canisters(principal);

    assert_eq!(1, canisters.len());
    assert_eq!(canister_id1, canisters[0].canister_id);
}

#[test]
fn set_and_get_imported_tokens() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let ledger_canister_id = PrincipalId::new_user_test_id(101);
    let index_canister_id = PrincipalId::new_user_test_id(102);

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens::default())
    );

    let imported_token = ImportedToken {
        ledger_canister_id,
        index_canister_id: Some(index_canister_id),
    };

    assert_eq!(
        store.set_imported_tokens(
            principal,
            ImportedTokens {
                imported_tokens: vec![imported_token.clone()],
            },
        ),
        SetImportedTokensResponse::Ok
    );

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens {
            imported_tokens: vec![imported_token],
        })
    );
}

#[test]
fn set_and_get_imported_tokens_without_index_canister() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let ledger_canister_id = PrincipalId::new_user_test_id(101);

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens::default())
    );

    let imported_token = ImportedToken {
        ledger_canister_id,
        index_canister_id: None,
    };

    assert_eq!(
        store.set_imported_tokens(
            principal,
            ImportedTokens {
                imported_tokens: vec![imported_token.clone()],
            },
        ),
        SetImportedTokensResponse::Ok
    );

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens {
            imported_tokens: vec![imported_token],
        })
    );
}

fn get_unique_imported_tokens(count: u64) -> Vec<ImportedToken> {
    (0..count)
        .map(|i| ImportedToken {
            ledger_canister_id: PrincipalId::new_user_test_id(i),
            index_canister_id: Some(PrincipalId::new_user_test_id(i + 1000)),
        })
        .collect()
}

#[test]
fn set_and_get_20_imported_tokens() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens::default())
    );

    let imported_tokens = get_unique_imported_tokens(20);

    assert_eq!(
        store.set_imported_tokens(
            principal,
            ImportedTokens {
                imported_tokens: imported_tokens.clone()
            },
        ),
        SetImportedTokensResponse::Ok
    );

    assert_eq!(
        store.get_imported_tokens(principal),
        GetImportedTokensResponse::Ok(ImportedTokens { imported_tokens })
    );
}

#[test]
fn set_imported_tokens_account_not_found() {
    let mut store = setup_test_store();
    let non_existing_principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    assert_eq!(
        store.set_imported_tokens(non_existing_principal, ImportedTokens::default()),
        SetImportedTokensResponse::AccountNotFound
    );
}

#[test]
fn set_imported_tokens_too_many() {
    let mut store = setup_test_store();
    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let imported_tokens = get_unique_imported_tokens(21);

    assert_eq!(
        store.set_imported_tokens(principal, ImportedTokens { imported_tokens },),
        SetImportedTokensResponse::TooManyImportedTokens { limit: 20 }
    );
}

#[test]
fn get_imported_tokens_account_not_found() {
    let mut store = setup_test_store();
    let non_existing_principal = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    assert_eq!(
        store.get_imported_tokens(non_existing_principal),
        GetImportedTokensResponse::AccountNotFound
    );
}

#[test]
fn sub_account_name_too_long() {
    let mut store = setup_test_store();

    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

    let res1 = store.create_sub_account(principal, "ABCDEFGHIJKLMNOPQRSTUVWX".to_string());
    let res2 = store.create_sub_account(principal, "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string());

    assert!(matches!(res1, CreateSubAccountResponse::Ok(_)));
    assert!(matches!(res2, CreateSubAccountResponse::NameTooLong));
}

#[test]
fn hardware_wallet_account_name_too_long() {
    let mut store = setup_test_store();

    let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    let res1 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWX".to_string(),
            principal: hw1,
        },
    );

    let res2 = store.register_hardware_wallet(
        principal,
        RegisterHardwareWalletRequest {
            name: "ABCDEFGHIJKLMNOPQRSTUVWXY".to_string(),
            principal: hw2,
        },
    );

    assert!(matches!(res1, RegisterHardwareWalletResponse::Ok));
    assert!(matches!(res2, RegisterHardwareWalletResponse::NameTooLong));
}

/// Test that the stats are as expected for a new test store.
pub(crate) fn assert_initial_test_store_stats_are_correct(stats: &Stats) {
    assert_eq!(2, stats.accounts_count);
    assert_eq!(0, stats.sub_accounts_count);
    assert_eq!(0, stats.hardware_wallet_accounts_count);
    assert_eq!(3, stats.block_height_synced_up_to.unwrap());
    assert!(stats.seconds_since_last_ledger_sync > 1_000_000_000);
}

/// The stats test should reject an empty response when we know that there is data in the accounts store.
#[test]
#[should_panic]
fn stats_test_should_fail_for_default_fill() {
    let stats = Stats::default();
    assert_initial_test_store_stats_are_correct(&stats);
}

#[test]
fn get_stats() {
    let mut store = setup_test_store();

    let mut stats = crate::stats::Stats::default();
    store.get_stats(&mut stats);
    assert_initial_test_store_stats_are_correct(&stats);

    let principal3 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let principal4 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    store.add_account(principal3);
    store.add_account(principal4);

    store.get_stats(&mut stats);

    assert_eq!(4, stats.accounts_count);

    for i in 1..10 {
        store.create_sub_account(principal3, i.to_string());
        store.get_stats(&mut stats);
        assert_eq!(i, stats.sub_accounts_count);
    }

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_5).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_6).unwrap();
    store.register_hardware_wallet(
        principal3,
        RegisterHardwareWalletRequest {
            name: "HW1".to_string(),
            principal: hw1,
        },
    );
    store.register_hardware_wallet(
        principal4,
        RegisterHardwareWalletRequest {
            name: "HW2".to_string(),
            principal: hw2,
        },
    );

    store.get_stats(&mut stats);
    assert_eq!(2, stats.hardware_wallet_accounts_count);

    store.mark_ledger_sync_complete();
    store.get_stats(&mut stats);
    assert!(stats.seconds_since_last_ledger_sync < 10);
}

/// Tests that `get_histogram()` returns correct values.
///
/// The test creates an account store and adds data, mirroring the test for `get_stats()`
/// exactly, and verifies that the histogram is as expected after every change.
#[test]
fn get_histogram() {
    let mut store = AccountsStore::default();

    // Initially the histogram should be empty.
    {
        let expected_histogram = AccountsStoreHistogram::default();
        let histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, histogram,
            "Histogram of an empty accounts store should be empty"
        );
    }

    // If we populate (or rather replace) the db with the standard test data, we should get a corresponding histogram:
    store = setup_test_store();
    let mut expected_histogram = test_store_histogram();
    {
        let histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, histogram,
            "Histogram of a standard test store may need to be updated"
        );
    }

    let principal3 = PrincipalId::from_str(TEST_ACCOUNT_3).unwrap();
    let principal4 = PrincipalId::from_str(TEST_ACCOUNT_4).unwrap();

    // Adding accounts should be accounted for correctly.  Pun intended.
    {
        store.add_account(principal3);
        store.add_account(principal4);

        // These new accounts are empty, so the 0 bucket should be incremented in each histogram:
        expected_histogram.accounts_count += 2;
        *expected_histogram.sub_accounts(0) += 2;
        *expected_histogram.hardware_wallet_accounts(0) += 2;
        *expected_histogram.canisters(0) += 2;

        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Adding accounts is not accounted for correctly"
        );
    }

    // Sub-accounts should be counted correctly:
    for i in 0..10 {
        store.create_sub_account(principal3, i.to_string());

        // The histogram entry for the number of sub-accounts will have changed from 0 to 1, 2 etc for one account:
        *expected_histogram.sub_accounts(i) -= 1;
        *expected_histogram.sub_accounts(i + 1) += 1;
        // Check:
        let actual_histogram = store.get_histogram();
        expected_histogram.remove_empty_buckets();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Adding the {}'th subaccount is not accounted for correctly",
            i
        );
    }

    let hw1 = PrincipalId::from_str(TEST_ACCOUNT_5).unwrap();
    let hw2 = PrincipalId::from_str(TEST_ACCOUNT_6).unwrap();
    // Hardware wallets should be counted correctly
    {
        store.register_hardware_wallet(
            principal3,
            RegisterHardwareWalletRequest {
                name: "HW1".to_string(),
                principal: hw1,
            },
        );
        store.register_hardware_wallet(
            principal4,
            RegisterHardwareWalletRequest {
                name: "HW2".to_string(),
                principal: hw2,
            },
        );
        // The two accounts (principal3 and principal4) have 1 hardware wallet each, so the 1 bucket should be incremented in each histogram:
        *expected_histogram.hardware_wallet_accounts(0) -= 2;
        *expected_histogram.hardware_wallet_accounts(1) += 2;

        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Hardware wallets are not counted correctly"
        );
    }

    // Canisters should be counted corerctly.
    for canister_index in 0..3 {
        let canister_id = CanisterId::from(canister_index);
        let attach_canister_request = AttachCanisterRequest {
            name: format!("canister_{canister_index}"),
            canister_id,
        };
        store.attach_canister(principal4, attach_canister_request);
        *expected_histogram.canisters(canister_index as usize) -= 1;
        *expected_histogram.canisters(canister_index as usize + 1) += 1;
        expected_histogram.remove_empty_buckets();
        let actual_histogram = store.get_histogram();
        assert_eq!(
            expected_histogram, actual_histogram,
            "Canisters are not counted correctly"
        );
    }
}

pub(crate) fn setup_test_store() -> AccountsStore {
    let principal1 = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
    let principal2 = PrincipalId::from_str(TEST_ACCOUNT_2).unwrap();
    let account_identifier1 = AccountIdentifier::from(principal1);
    let account_identifier2 = AccountIdentifier::from(principal2);
    let mut store = AccountsStore::default();
    store.add_account(principal1);
    store.add_account(principal2);
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 0).unwrap();
    }
    {
        let transfer = Mint {
            amount: Tokens::from_e8s(1_000_000_000),
            to: account_identifier1,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 1).unwrap();
    }
    {
        let transfer = Burn {
            amount: Tokens::from_e8s(500_000_000),
            from: account_identifier1,
            spender: None,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 2).unwrap();
    }
    {
        let transfer = Transfer {
            amount: Tokens::from_e8s(300_000_000),
            fee: Tokens::from_e8s(1_000),
            spender: None,
            from: account_identifier1,
            to: account_identifier2,
        };
        store.maybe_process_transaction(&transfer, Memo(0), 3).unwrap();
    }
    store
}

/// The histogram corresponding to a test store.
///
/// Compare with the `setup_test_store()` function to verify that this is the expected histogram;
/// if that changes, these stats are likely to change as well.
pub fn test_store_histogram() -> AccountsStoreHistogram {
    let mut ans = AccountsStoreHistogram::default();
    ans.accounts_count = 2;
    *ans.sub_accounts(0) += 2; // Neither test account has sub-accounts.
    *ans.hardware_wallet_accounts(0) += 2; // Neither test account has hardware wallets.
    *ans.canisters(0) += 2; // Neither test account has canisters.
    ans
}

/// Stored accounts should be recovered with the same value.
///
/// Note: Given that account implement `CandidType` this is little more than a formality.
#[test]
fn accounts_should_implement_storable() {
    let account = toy_account(
        1,
        ToyAccountSize {
            sub_accounts: 2,
            canisters: 3,
            hardware_wallets: 6,
        },
    );
    let bytes = account.to_bytes();
    let parsed = Account::from_bytes(bytes);
    assert_eq!(account, parsed);
}

crate::accounts_store::schema::tests::test_accounts_db!(AccountsStore::default());
