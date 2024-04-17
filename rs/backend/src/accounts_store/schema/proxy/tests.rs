use ic_stable_structures::memory_manager;
use pretty_assertions::assert_eq;
use proptest::proptest;
use rand::seq::IteratorRandom;
use rand::{Rng, SeedableRng};
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use crate::accounts_store::schema::tests::toy_account;
use crate::accounts_store::{CanisterId, NamedCanister};
use crate::state::partitions::PartitionType;

use super::super::tests::test_accounts_db;
use super::*;

test_accounts_db!(AccountsDbAsProxy::default());

fn migration_steps_should_work(accounts_db: &mut AccountsDbAsProxy, new_accounts_db: AccountsDb) {
    // During the migration, the accounts db should behave as if no migration were in progress,
    // regardless of what CRUD operations are performed.  We check this by running another database
    // with the same contents but no migration.
    let reference_db = AccountsDbAsProxy::from(AccountsDb::Map(AccountsDbAsMap::from_map(
        accounts_db.range(..).collect(),
    )));
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
            accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
        }
    }
    // The next step should complete the migration.
    accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
    assert_eq!(*accounts_db, reference_db);
    assert!(
        accounts_db.migration.is_none(),
        "After completing a migration, there should be no migration in progress"
    );
    // Further steps are not needed but should be harmless.
    accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
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
            accounts_db.db_insert_account(&toy_account_index.to_be_bytes()[..], toy_account);
        }
    }
}

/// Modifications that may occur to the database contents.
#[derive(Copy, Clone, Debug, EnumIter)]
enum Operation {
    StepMigration,
    /// Inserts an account with a random key.
    ///
    /// Note: The key will sometimes be before `next_to_migrate` and sometimes after.
    Insert,
    /// Modifies a randomly chosen account.
    Update,
    /// Removes a randomly chosen account.
    ///
    /// Note: Even `next_to_migrate` may be removed.
    Delete,
}

impl Operation {
    /// Performs operations on two databases.  One database is being migrated, the other is a reference database.
    /// - Migration steps are applied to the migrating database only.
    /// - Other operations are applied with identical, randomly chosen, arguments to both databases.
    fn perform<R>(&self, accounts_db: &mut AccountsDbAsProxy, reference_db: &mut AccountsDbAsProxy, rng: &mut R)
    where
        R: Rng + ?Sized,
    {
        match self {
            Operation::StepMigration => accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE),
            Operation::Insert => {
                let key = rng.gen::<[u8; 32]>();
                let account = toy_account(rng.gen(), rng.gen_range(0..5));
                for db in [accounts_db, reference_db] {
                    db.db_insert_account(&key[..], account.clone());
                }
            }
            Operation::Update => {
                if let Some(key) = accounts_db.range(..).choose(rng).map(|(key, _account)| key.clone()) {
                    let canister_to_add_to_account = NamedCanister {
                        name: "test".to_string(),
                        canister_id: CanisterId::from_u64(rng.gen()),
                    };
                    for db in [accounts_db, reference_db] {
                        if let Some(mut account) = db.db_get_account(&key[..]) {
                            account.canisters.push(canister_to_add_to_account.clone());
                            db.db_insert_account(&key[..], account);
                        }
                    }
                }
            }
            Operation::Delete => {
                if let Some(account_to_delete) = accounts_db.range(..).choose(rng).map(|(key, _account)| key.clone()) {
                    for db in [accounts_db, reference_db] {
                        db.db_remove_account(&account_to_delete);
                    }
                }
            }
        }
    }
}

/// Asserts that migration works when other operations are performed.
///
/// - Takes two databases with the same contents.
/// - One database is migrated, the other is not.  The two databases should always have the same contents.
/// - Migration steps are mixed together with other operations until the migration is complete.
///
/// Note: Theoretically this test could choose so many insertions that migration never completes, however assuming
/// that the random number generator is fair, this is most unlikely.
fn assert_migration_works_with_other_operations<R>(
    accounts_db: &mut AccountsDbAsProxy,
    reference_db: &mut AccountsDbAsProxy,
    new_accounts_db: AccountsDb,
    rng: &mut R,
) where
    R: Rng,
{
    // Check that the database initial states are correct.
    assert_eq!(accounts_db, reference_db, "Test setup failure: When starting, the reference database should have the same contents as the database being tested.");
    assert_eq!(
        new_accounts_db.db_accounts_len(),
        0,
        "Test setup failure: The new database should be empty."
    );
    // Check which schema we are moving to.
    let expected_final_schema_label = new_accounts_db.schema_label();
    // Start migration.
    accounts_db.start_migrating_accounts_to(new_accounts_db);
    // Perform operations.
    while accounts_db.migration.is_some() {
        // Sometimes step the migration, sometimes perform another operation: insert, update or delete.
        let operation = Operation::iter().choose(rng).expect("Failed to choose an operation");
        operation.perform(accounts_db, reference_db, rng);
        assert_eq!(accounts_db, reference_db);
    }
    // Migration should now be complete.
    assert!(accounts_db.migration.is_none());
    assert!(
        accounts_db.schema_label() == expected_final_schema_label,
        "The final schema should be {expected_final_schema_label:#?}"
    );
}

fn assert_map_to_map_migration_works_with_other_operations<R>(rng: &mut R)
where
    R: Rng,
{
    let mut accounts_db = AccountsDbAsProxy::default();
    let mut reference_db = AccountsDbAsProxy::default();
    let new_accounts_db = AccountsDb::Map(AccountsDbAsMap::default());
    // Check that the default storage is indeed a map.
    assert!(accounts_db.schema_label() == SchemaLabel::Map);
    // Insert some accounts
    let number_of_accounts_to_migrate: u32 = rng.gen_range(0..100);
    for _ in 0..number_of_accounts_to_migrate {
        Operation::Insert.perform(&mut accounts_db, &mut reference_db, rng);
    }
    // Test migration
    assert_migration_works_with_other_operations(&mut accounts_db, &mut reference_db, new_accounts_db, rng);
}

fn assert_map_to_stable_migration_works_with_other_operations<R>(rng: &mut R)
where
    R: Rng,
{
    let mut accounts_db = AccountsDbAsProxy::default();
    let mut reference_db = AccountsDbAsProxy::default();
    let raw_memory = DefaultMemoryImpl::default();
    let memory_manager = memory_manager::MemoryManager::init(raw_memory);
    let new_accounts_db = AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::new(
        memory_manager.get(PartitionType::Accounts.memory_id()),
    ));
    // Insert some accounts
    let number_of_accounts_to_migrate: u32 = rng.gen_range(0..100);
    for _ in 0..number_of_accounts_to_migrate {
        Operation::Insert.perform(&mut accounts_db, &mut reference_db, rng);
    }
    // Test migration
    assert_migration_works_with_other_operations(&mut accounts_db, &mut reference_db, new_accounts_db, rng);
}

fn assert_stable_to_map_migration_works_with_other_operations<R>(rng: &mut R)
where
    R: Rng,
{
    let raw_memory = DefaultMemoryImpl::default();
    let memory_manager = memory_manager::MemoryManager::init(raw_memory);
    let accounts_db = AccountsDbAsUnboundedStableBTreeMap::new(memory_manager.get(PartitionType::Accounts.memory_id()));
    let mut accounts_db = AccountsDbAsProxy::from(AccountsDb::UnboundedStableBTreeMap(accounts_db));
    let mut reference_db = AccountsDbAsProxy::default();
    let new_accounts_db = AccountsDb::Map(AccountsDbAsMap::default());
    // Insert some accounts
    let number_of_accounts_to_migrate: u32 = rng.gen_range(0..100);
    for _ in 0..number_of_accounts_to_migrate {
        Operation::Insert.perform(&mut accounts_db, &mut reference_db, rng);
    }
    // Test migration
    assert_migration_works_with_other_operations(&mut accounts_db, &mut reference_db, new_accounts_db, rng);
}

proptest! {
    #[test]
    fn map_to_map_migration_should_work_with_other_operations(seed: u64) {
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed);
        assert_map_to_map_migration_works_with_other_operations(&mut rng);
    }
    #[test]
    fn map_to_stable_migration_should_work_with_other_operations(seed: u64) {
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed);
        assert_map_to_stable_migration_works_with_other_operations(&mut rng);
    }
    #[test]
    fn stable_to_map_migration_should_work_with_other_operations(seed: u64) {
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed);
        assert_stable_to_map_migration_works_with_other_operations(&mut rng);
    }

}

/// Migration should not be finalized if the account databases have a different number of accounts.
#[test]
fn migration_should_be_aborted_if_the_new_db_has_a_different_number_of_accounts() {
    // Creates a database with some accounts.
    let mut accounts_db = AccountsDbAsProxy::default();
    let number_of_accounts_to_migrate: u8 = u8::try_from(2 * AccountsDbAsProxy::MIGRATION_STEP_SIZE)
        .expect("Default step size too big for this test; use a custom step size instead.");
    for i in 0..number_of_accounts_to_migrate {
        let key = [i; 32];
        let account = toy_account(u64::from(i), 0);
        accounts_db.db_insert_account(&key, account);
    }
    assert_eq!(
        accounts_db.db_accounts_len(),
        u64::from(number_of_accounts_to_migrate),
        "The test should have created the expected number of accounts"
    );
    // Starts the migration.
    let new_accounts_db = AccountsDb::Map(AccountsDbAsMap::default());
    accounts_db.start_migrating_accounts_to(new_accounts_db);
    // Migrate account 0:
    accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
    let key_to_remove = [0u8; 32];
    assert!(
        accounts_db
            .migration
            .as_ref()
            .unwrap()
            .db
            .db_get_account(&key_to_remove)
            .is_some(),
        "Expected the first account to have been migrated"
    );
    // Breaks the invariant by deleting account zero from the old db.  The migration will not move it back unless the account is changed, hence updated in both the authoritative and new db, and we will not update it.  Thus sanity checks should fail on finalization.
    accounts_db.authoritative_db.db_remove_account(&key_to_remove);
    assert!(
        accounts_db.authoritative_db.db_get_account(&key_to_remove).is_none(),
        "Account zero should have been removed from the authoritative db."
    );
    assert_eq!(
        accounts_db.authoritative_db.db_accounts_len(),
        number_of_accounts_to_migrate as u64 - 1,
        "The number of accounts in the authoritative db should be the original number minus one"
    );
    assert!(
        accounts_db
            .migration
            .as_ref()
            .unwrap()
            .db
            .db_get_account(&key_to_remove)
            .is_some(),
        "Expected the first account still to be in the migration db."
    );
    // Finish the migration.
    // ... Limit the number of steps, just so that we don't get an infinite loop if there is a bug and migration never finishes.
    let plenty_of_steps = u32::from(number_of_accounts_to_migrate) + AccountsDbAsProxy::MIGRATION_FINALIZATION_BLOCKS;
    for _ in 0..plenty_of_steps {
        accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
        if accounts_db.migration.is_none() {
            break;
        } else {
            // Note: This is called at least once as the number of accounts is greater than the step size.
            assert!(
                accounts_db.authoritative_db.db_get_account(&key_to_remove).is_none(),
                "Account zero should still be missing in the authoritative db."
            );
            assert_eq!(
                accounts_db.authoritative_db.db_accounts_len(),
                number_of_accounts_to_migrate as u64 - 1,
                "The number of accounts in the authoritative db should be the original number minus one"
            );
            assert!(
                accounts_db
                    .migration
                    .as_ref()
                    .unwrap()
                    .db
                    .db_get_account(&key_to_remove)
                    .is_some(),
                "Expected the first account still to be in the migration db."
            );
        }
    }
    // The migration should have been cancelled:
    assert!(
        accounts_db.migration.is_none(),
        "The migration should have been cancelled"
    );
    // The number of accounts should be as for the old database.
    assert_eq!(
        accounts_db.authoritative_db.db_accounts_len(),
        number_of_accounts_to_migrate as u64 - 1,
        "The number of accounts should be as for the old database"
    );
}

/// Migration should not be finalized if the first account differs in the two databases.
#[test]
fn migration_should_be_aborted_if_the_new_db_has_a_different_first_account() {
    // Creates a database with some accounts.
    let mut accounts_db = AccountsDbAsProxy::default();
    let number_of_accounts_to_migrate: u8 = u8::try_from(2 * AccountsDbAsProxy::MIGRATION_STEP_SIZE)
        .expect("Default step size too big for this test; use a custom step size instead.");
    for i in 0..number_of_accounts_to_migrate {
        let key = [i; 32];
        let account = toy_account(u64::from(i), 0);
        accounts_db.db_insert_account(&key, account);
    }
    // Starts the migration.
    let new_accounts_db = AccountsDb::Map(AccountsDbAsMap::default());
    accounts_db.start_migrating_accounts_to(new_accounts_db);
    // Migrate account 0:
    accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
    let key_to_change = [0u8; 32];
    assert!(
        accounts_db
            .migration
            .as_ref()
            .unwrap()
            .db
            .db_get_account(&key_to_change)
            .is_some(),
        "Expected the first account to have been migrated"
    );
    // Breaks the invariant by altering the first account in the authoritative db but not the new db.
    let original_account = accounts_db.authoritative_db.db_get_account(&key_to_change).unwrap();
    let altered_account = toy_account(0, 1);
    assert_ne!(
        original_account, altered_account,
        "The original and altered accounts should differ"
    );
    accounts_db
        .authoritative_db
        .db_insert_account(&key_to_change, altered_account.clone());
    // Finish the migration.
    // ... Limit the number of steps, just so that we don't get an infinite loop if there is a bug and migration never finishes.
    let plenty_of_steps = u32::from(number_of_accounts_to_migrate) + AccountsDbAsProxy::MIGRATION_FINALIZATION_BLOCKS;
    for _ in 0..plenty_of_steps {
        accounts_db.step_migration(AccountsDbAsProxy::MIGRATION_STEP_SIZE);
        if accounts_db.migration.is_none() {
            break;
        } else {
            // Note: This is called at least once as the number of accounts is greater than the step size.
            assert_ne!(
                accounts_db.authoritative_db.db_get_account(&key_to_change),
                accounts_db
                    .migration
                    .as_ref()
                    .unwrap()
                    .db
                    .db_get_account(&key_to_change),
                "Expected the first account still to be different in the migration db."
            );
        }
    }
    // The migration should have been cancelled:
    assert!(
        accounts_db.migration.is_none(),
        "The migration should have been cancelled"
    );
    // The first account should be as for the old database.
    assert_eq!(
        accounts_db.authoritative_db.db_get_account(&key_to_change),
        Some(altered_account),
        "The first account should be as for the old database"
    );
}
