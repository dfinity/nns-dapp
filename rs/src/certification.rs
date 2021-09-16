use crate::accounts_store::LABEL_ACCOUNTS;
use crate::assets::{LABEL_ASSETS, STATE as ASSET_STATE};
use crate::state::STATE;

use candid::CandidType;
use dfn_core::api::set_certified_data;
use ic_certified_map::{fork_hash, labeled_hash, AsHashTree};

#[derive(CandidType)]
pub struct GetCertifiedResponse<S: CandidType, T: CandidType> {
    pub response_data: Option<S>,
    pub certified_data: Option<T>,
    pub hash_tree: String,
    pub certificate: Vec<u8>,
}

pub fn update_root_hash() {
    STATE.with(|s| {
        ASSET_STATE.with(|a| {
            let prefixed_root_hash = fork_hash(
                // NB: Labels added in lexicographic order
                &labeled_hash(
                    LABEL_ACCOUNTS,
                    &s.accounts_store.borrow().accounts.root_hash(),
                ),
                &labeled_hash(LABEL_ASSETS, &a.asset_hashes.borrow().root_hash()),
            );
            set_certified_data(&prefixed_root_hash[..]);
        });
    });
}
