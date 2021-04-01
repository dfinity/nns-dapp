use crate::state::STATE;
use dfn_candid::candid;
use ic_nns_constants::LEDGER_CANISTER_ID;
use lazy_static::lazy_static;
use ledger_canister::{BlockHeight, BlockLike, EncodedBlock};
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<bool> = Mutex::new(false);
}

pub async fn sync_transactions() -> Option<Result<u32, String>> {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_err() {
        return None;
    }

    Some(sync_transactions_within_lock().await)
}

async fn sync_transactions_within_lock() -> Result<u32, String> {
    let store = &mut STATE.write().unwrap().transactions_store;
    let next_block_height = store.get_next_required_block_height();

    match get_blocks(next_block_height).await {
        Ok(blocks) => {
            let blocks_count = blocks.len() as u32;
            for (block, block_height) in blocks.into_iter() {
                let result = store.append_transaction(block.transaction().into_owned().transfer, block_height, block.timestamp());

                if result.is_err() {
                    return Err(result.unwrap_err());
                }
            }
            Ok(blocks_count)
        }
        Err(e) => Err(e),
    }
}

async fn get_blocks(from_block_height: BlockHeight) -> Result<Vec<(Box<dyn BlockLike>, BlockHeight)>, String> {
    let raw_blocks: Vec<EncodedBlock> = dfn_core::call(
        LEDGER_CANISTER_ID,
        "get_blocks",
        candid,
        (from_block_height as usize, 128usize),
    )
    .await
    .map_err(|e| e.1)?;

    Ok(raw_blocks
        .into_iter()
        .enumerate()
        .map(|(index, b)| {
            let block = b.decode().unwrap();
            let block_height = from_block_height + (index as u64);
            (block, block_height)
        })
        .collect())
}
