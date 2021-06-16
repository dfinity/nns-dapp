use crate::canisters;
use crate::state::STATE;
use ic_base_types::CanisterId;
use ic_nns_constants::LEDGER_CANISTER_ID;
use ledger_canister::BlockHeight;
use ledger_canister::protobuf::ArchiveIndexResponse;
use std::cell::RefCell;

thread_local! {
    static DATA: RefCell<Option<MemoSyncData>> = RefCell::new(None);
}

#[derive(Default)]
pub struct MemoSyncData {
    remaining: Vec<BlockHeight>,
    archive_index: ArchiveIndexResponse,
}

impl MemoSyncData {
    pub fn new(remaining: Vec<BlockHeight>, archive_index: ArchiveIndexResponse) -> MemoSyncData {
        MemoSyncData {
            remaining,
            archive_index
        }
    }
}

pub fn is_initialized() -> bool {
    DATA.with(|d| d.borrow().is_some())
}

pub async fn init() {
    if let Ok(archive_index) = canisters::ledger::get_archive_index().await {
        let block_heights_with_missing_memo = STATE.read().unwrap()
            .accounts_store.get_block_heights_with_missing_memo();

        DATA.with(|d| *d.borrow_mut() = Some(MemoSyncData::new(block_heights_with_missing_memo, archive_index)));
    }
}

pub fn count_remaining() -> u32 {
    DATA.with(|d| d.borrow().as_ref().unwrap().remaining.len() as u32)
}

pub async fn sync_next() -> Result<(), String> {
    if let Some((block_height, canister_id)) = take_next() {
        let memo = canisters::ledger::get_block(canister_id, block_height).await?
            .decode().unwrap().transaction.memo;

        STATE.write().unwrap().accounts_store.set_memo(block_height, memo);

        Ok(())
    } else {
        Err("None left to sync".to_string())
    }
}

fn take_next() -> Option<(BlockHeight, CanisterId)> {
    let count_remaining = count_remaining();
    if count_remaining == 0 {
        return None;
    }

    DATA.with(|d| {
        let last_index = (count_remaining as usize) - 1;
        let next_block_height = d.borrow_mut().as_mut().unwrap().remaining.remove(last_index);

        let canister_id = d.borrow().as_ref().unwrap().archive_index.entries
            .iter()
            .find(|e| e.height_from <= next_block_height && next_block_height <= e.height_to)
            .map(|e| e.canister_id)
            .flatten()
            .map(|c| CanisterId::new(c).unwrap())
            .unwrap_or(LEDGER_CANISTER_ID);

        Some((next_block_height, canister_id))
    })
}