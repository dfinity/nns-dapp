use crate::ledger;
use crate::state::STATE;
use lazy_static::lazy_static;
use ledger_canister::{Block, BlockHeight};
use std::cmp::min;
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
    let block_height_synced_up_to = get_block_height_synced_up_to();
    let latest_block_height = ledger::tip_of_chain().await?;

    if block_height_synced_up_to.is_none() {
        let store = &mut STATE.write().unwrap().transactions_store;
        store.init_block_height_synced_up_to(latest_block_height);
        store.mark_ledger_sync_complete();
        return Ok(0);
    }

    let next_block_height_required = block_height_synced_up_to.unwrap() + 1;
    if latest_block_height < next_block_height_required {
        let store = &mut STATE.write().unwrap().transactions_store;
        store.mark_ledger_sync_complete();
        Ok(0)
    } else {
        const MAX_BLOCKS_PER_EXECUTION: u64 = 500;
        let count = min(latest_block_height - next_block_height_required + 1, MAX_BLOCKS_PER_EXECUTION);

        let blocks = get_blocks(next_block_height_required, count as u32).await?;
        let store = &mut STATE.write().unwrap().transactions_store;
        let blocks_count = blocks.len() as u32;
        for (block_height, block) in blocks.into_iter() {
            let result = store.append_transaction(block.transaction().into_owned().transfer, block_height, block.timestamp());

            if result.is_err() {
                return Err(result.unwrap_err());
            }
        }
        store.mark_ledger_sync_complete();
        Ok(blocks_count)
    }
}

fn get_block_height_synced_up_to() -> Option<BlockHeight> {
    let store = &STATE.read().unwrap().transactions_store;
    store.get_block_height_synced_up_to()
}

async fn get_blocks(from: BlockHeight, count: u32) -> Result<Vec<(BlockHeight, Block)>, String> {
    const MAX_BLOCKS_PER_BATCH: u32 = 100;
    let mut batch_start = from;
    let mut count_remaining = count;
    let mut results: Vec<(BlockHeight, Block)> = Vec::with_capacity(count as usize);

    loop {
        let batch_size = min(count_remaining, MAX_BLOCKS_PER_BATCH);

        let blocks = ledger::get_blocks(batch_start, batch_size).await?;

        for (block_height, block) in blocks
            .into_iter()
            .enumerate()
            .map(|(index, block)| (from + (index as u64), block.decode().unwrap())) {
            results.push((block_height, block));
        }

        count_remaining = count_remaining - batch_size;
        if count_remaining > 0 {
            batch_start = batch_start + batch_size as u64;
        } else {
            break;
        }
    }

    Ok(results)
}
