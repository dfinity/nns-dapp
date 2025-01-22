//! Code for migration from the authoritative database to a new database.
use super::{AccountsDbAsProxy, AccountsDbTrait};
use ic_cdk::{eprintln, println};

impl AccountsDbAsProxy {
    /// The default number of accounts to move in a migration step.
    pub const MIGRATION_STEP_SIZE: u32 = 20;
    /// The maximum number of accounts to move in a migration step.
    pub const MIGRATION_STEP_SIZE_MAX: u32 = 1000;
    /// The progress meter count reserved for finalizing a migration.
    pub const MIGRATION_FINALIZATION_BLOCKS: u32 = 1;

    /// Determines whether a migration is in progress.
    #[must_use]
    #[allow(dead_code)]
    pub fn migration_in_progress(&self) -> bool {
        self.migration.is_some()
    }

    /// Migration countdown; when it reaches zero, the migration is complete.
    ///
    /// Note: This is a rough estimate of the number of blocks needed to complete the migration.
    ///       The approximation is caused by the following:
    ///       - If an entry is added or modified ahead of the "next to migrate" entry, the element will still be migrated but the delta between the size of the authoritative db and the new db will reduce by one.
    ///         This approximation is unlikely to be an issue but if it is, it can be corrected for with a small increase in complexity:
    ///         When performing CRUD, apply the operation to the new database ONLY if either:
    ///         - `next_to_migrate` is `None` (i.e. the migration is complete)
    ///         - The key is strictly less than `next_to_migrate`.
    ///       - If the migration encounters a batch of extremely large accounts, migration slows down.
    #[must_use]
    pub fn migration_countdown(&self) -> u32 {
        self.migration.as_ref().map_or(0, |migration| {
            let accounts_to_migrate = self
                .authoritative_db
                .db_accounts_len()
                .saturating_sub(migration.db.db_accounts_len());
            let blocks_for_migration = accounts_to_migrate.div_ceil(u64::from(Self::MIGRATION_STEP_SIZE));
            let blocks_for_migration = u32::try_from(blocks_for_migration).unwrap_or(u32::MAX);
            blocks_for_migration.saturating_add(Self::MIGRATION_FINALIZATION_BLOCKS)
        })
    }

    /// Advances the migration by one step.
    ///
    /// # Arguments
    /// - `step_size`: The maximum number of accounts to migrate on this step.
    ///   - This may be no larger than `Self::MIGRATION_STEP_SIZE_MAX`.  If it is larger, it will be reduced.
    pub fn step_migration(&mut self, step_size: u32) {
        // Ensure that the step size is modest:
        let step_size = step_size.clamp(1, Self::MIGRATION_STEP_SIZE_MAX);
        if let Some(migration) = &mut self.migration {
            if let Some(next_to_migrate) = &migration.next_to_migrate {
                println!("Stepping migration: {:?} -> {:?}", self.authoritative_db, migration.db);
                let mut range = self.authoritative_db.range(next_to_migrate.clone()..);
                for (key, account) in (&mut range).take(usize::try_from(step_size).unwrap_or(usize::MAX)) {
                    migration.db.db_insert_account(&key, account);
                }
                migration.next_to_migrate = range.next().map(|(key, _account)| key.clone());
            } else {
                self.complete_migration();
            }
        }
    }

    /// Completes any migration in progress.
    ///
    /// The migration will be cancelled, instead of completed, if an invariant check fails:
    ///     - The old and new databases have different lengths.
    ///     - (More checks MAY be added in future.)
    pub fn complete_migration(&mut self) {
        if let Some(migration) = self.migration.take() {
            // Sanity check before calling migration complete:
            {
                // Number of accounts should be the same:
                let old = self.authoritative_db.db_accounts_len();
                let new = migration.db.db_accounts_len();
                if old != new {
                    eprintln!("MIGRATION ERROR: Account migration failed: Old and new account databases have different lengths: {old} -> {new}\n Migration will be aborted.");
                    return;
                }
            }
            {
                // The first account in the BTreeMap should be the same.
                // Given that keys are random this effectively a random account.
                //
                // Note: IF the migration intentionally modifies accounts, this check will have to be adjusted to compare just the invariant aspects of the account.
                let old = self.authoritative_db.first_key_value();
                let new = migration.db.first_key_value();
                if old != new {
                    eprintln!("MIGRATION ERROR: Old and new account databases have different first entries: {old:?} -> {new:?}\n Migration will be aborted.");
                    return;
                }
            }
            {
                // The last account in the BTreeMap should be the same.
                // Given that keys are random this effectively a random account.
                //
                // Note: IF the migration intentionally modifies accounts, this check will have to be adjusted to compare just the invariant aspects of the account.
                let old = self.authoritative_db.last_key_value();
                let new = migration.db.last_key_value();
                if old != new {
                    eprintln!("MIGRATION ERROR: Old and new account databases have different last entries: {old:?} -> {new:?}\n Migration will be aborted.");
                    return;
                }
            }
            // Sanity checks passed.  Make the new database authoritative:
            println!(
                "Account migration complete: {:?} -> {:?}",
                self.authoritative_db, migration.db
            );
            self.authoritative_db = migration.db;
        }
    }
}
