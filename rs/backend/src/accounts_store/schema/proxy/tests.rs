use crate::accounts_store::schema::tests::toy_account;
use crate::accounts_store::schema::AccountsDbBTreeMapTrait;

use super::super::tests::{assert_map_conversions_work, test_accounts_db};
use super::*;

test_accounts_db!(AccountsDbAsProxy::default());

#[test]
fn map_conversions_should_work() {
    assert_map_conversions_work::<AccountsDbAsProxy>();
}

fn migration_steps_should_work(accounts_db: &mut AccountsDbAsProxy, new_accounts_db: AccountsDb) {
    // During the migration, the accounts db should behave as if no migration were in progress,
    // regardless of what CRUD operations are performed.  We check this by running another database
    // with the same contents but no migration.
    let reference_db = AccountsDbAsProxy::from_map(accounts_db.range(..).collect());
    assert_eq!(*accounts_db, reference_db);
    // Start the migration.
    accounts_db.start_migrating_accounts_to(new_accounts_db);
    // Step through the migration
    let expected_steps_needed = (reference_db.db_accounts_len() + u64::from(AccountsDbAsProxy::MIGRATION_STEP_SIZE)
        - 1)
        / u64::from(AccountsDbAsProxy::MIGRATION_STEP_SIZE)
        + 1;
    for step in 0.. {
        assert_eq!(*accounts_db, reference_db);
        assert!(
            accounts_db.migration.is_some(),
            "On step {} there should be an active migration",
            step
        );
        let expected_accounts_in_new_db =
            (step * u64::from(AccountsDbAsProxy::MIGRATION_STEP_SIZE)).min(reference_db.db_accounts_len());
        assert_eq!(accounts_db.migration.as_ref().unwrap().db.db_accounts_len(), expected_accounts_in_new_db, "The new DB should have migrated step_number * step_size accounts, maxing out when all accounts have been migrated.  This is step {} of the migration but the expected number of accounts hasn't been migrated.", step);
        assert_eq!(u64::from(accounts_db.migration_countdown()), expected_steps_needed - step, "The migration countdown should be the number of steps needed ({}) minus the number of steps taken so far ({}).", expected_steps_needed, step);
        if expected_accounts_in_new_db == reference_db.db_accounts_len() {
            break;
        } else {
            accounts_db.step_migration();
        }
    }
    // The next step should comp[lete the migration.
    accounts_db.step_migration();
    assert_eq!(*accounts_db, reference_db);
    assert!(
        accounts_db.migration.is_none(),
        "After completing a migration, there should be no migration in progress"
    );
    // Further steps are not needed but should be harmless.
    accounts_db.step_migration();
    assert!(
        accounts_db.migration.is_none(),
        "Further steps should not create another migration"
    );
    assert_eq!(*accounts_db, reference_db);
}

#[test]
fn migration_from_map_to_map_should_work() {
    let mut accounts_db = AccountsDbAsProxy::default();
    // Test migration when there are no accounts, repeat with a few accounts, a few more and so on.
    let mut toy_account_index = 0;
    let canisters_per_toy_account = 4;
    for _ in 0..2 {
        let new_accounts_db = AccountsDb::Map(AccountsDbAsMap::default());
        migration_steps_should_work(&mut accounts_db, new_accounts_db);
        // Add a few more accounts.
        for _ in 0..3 {
            toy_account_index += 1;
            let toy_account = toy_account(toy_account_index, canisters_per_toy_account);
            let toy_account_key = format!("toy_account_{}", toy_account_index);
            accounts_db.db_insert_account(toy_account_key.as_bytes(), toy_account);
        }
    }
}
