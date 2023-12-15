//! Code for migration from the authoritative database to a new database.
use super::*;

impl AccountsDbAsProxy {
    /// The number of accounts to move per heartbeat.
    pub const MIGRATION_STEP_SIZE: u32 = 10;
    /// The progress meter count reserved for finalizing a migration.
    /// Note: This must be positive and should correspond to a reasonable estimate of the number of blocks needed to complete the migration.
    pub const MIGRATION_FINALIZATION_BLOCKS: u32 = 1;

    /// Migration countdown; when it reaches zero, the migration is complete.
    ///
    /// Note: This is a rough estimate of the number of blocks needed to complete the migration.
    pub fn migration_countdown(&self) -> u32 {
        self.migration.as_ref().map_or(0, |migration| {
            Self::MIGRATION_FINALIZATION_BLOCKS
                + u32::try_from(
                    self.authoritative_db
                        .db_accounts_len()
                        .saturating_sub(migration.db.db_accounts_len()),
                )
                .expect("Huge difference in accounts count")
                    / Self::MIGRATION_STEP_SIZE
        })
    }
    /// Starts a migration, if needed.
    ///
    /// # Panics
    /// - If the new database is not empty.
    #[cfg(test)]
    pub fn start_migrating_accounts_to(&mut self, accounts_db: AccountsDb) {
        assert!(
            accounts_db.db_accounts_len() == 0,
            "The DB to migrate to should be empty"
        );
        let migration = Migration {
            db: accounts_db,
            next_to_migrate: self.authoritative_db.iter().next().map(|(key, _account)| key.clone()),
        };
        dfn_core::api::print(format!(
            "Starting account migration: {:?} -> {:?}",
            self.authoritative_db, migration.db
        ));
        self.migration = Some(migration);
    }

    /// Advances the migration by one step.
    #[cfg(test)]
    pub fn step_migration(&mut self) {
        if let Some(migration) = &mut self.migration {
            if let Some(next_to_migrate) = &migration.next_to_migrate {
                dfn_core::api::print(format!(
                    "Stepping migration: {:?} -> {:?}",
                    self.authoritative_db, migration.db
                ));
                let mut range = self.authoritative_db.range(next_to_migrate.clone()..);
                for (key, account) in (&mut range).take(Self::MIGRATION_STEP_SIZE as usize) {
                    migration.db.db_insert_account(&key, account);
                }
                migration.next_to_migrate = range.next().map(|(key, _account)| key.clone());
            } else {
                self.complete_migration();
            }
        }
    }

    /// Completes any migration in progress.
    #[cfg(test)]
    pub fn complete_migration(&mut self) {
        if let Some(migration) = self.migration.take() {
            dfn_core::api::print(format!(
                "Account migration complete: {:?} -> {:?}",
                self.authoritative_db, migration.db
            ));
            self.authoritative_db = migration.db;
        }
    }
}
