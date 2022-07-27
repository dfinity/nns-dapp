use crate::canisters::ledger;
use crate::state::STATE;
use dfn_core::CanisterId;
use ic_ledger_core::block::BlockType;
use ic_nns_constants::LEDGER_CANISTER_ID;
use lazy_static::lazy_static;
use ledger_canister::protobuf::ArchiveIndexEntry;
use ledger_canister::{Block, BlockHeight};
use std::cmp::{max, min};
use std::ops::RangeInclusive;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

pub async fn sync_transactions() -> Option<Result<u32, String>> {
    // Ensure this process only runs once at a time
    if LOCK.try_lock().is_ok() {
        Some(sync_transactions_within_lock().await)
    } else {
        None
    }
}

async fn sync_transactions_within_lock() -> Result<u32, String> {
    let block_height_synced_up_to = get_block_height_synced_up_to();
    let tip_of_chain = ledger::tip_of_chain().await?;

    if block_height_synced_up_to.is_none() {
        // We only reach here on service initialization and we don't care about previous blocks, so
        // we mark that we are synced with the latest tip_of_chain and return so that subsequent
        // syncs will continue from there
        STATE.with(|s| {
            let mut store = s.accounts_store.borrow_mut();
            store.init_block_height_synced_up_to(tip_of_chain);
            store.mark_ledger_sync_complete();
        });
        return Ok(0);
    }

    let next_block_height_required = block_height_synced_up_to.unwrap() + 1;
    if tip_of_chain < next_block_height_required {
        // There are no new blocks since our last sync, so mark sync complete and return
        STATE.with(|s| s.accounts_store.borrow_mut().mark_ledger_sync_complete());
        Ok(0)
    } else {
        let blocks = get_blocks(next_block_height_required, tip_of_chain).await?;
        STATE.with(|s| {
            let mut store = s.accounts_store.borrow_mut();
            let blocks_count = blocks.len() as u32;
            for (block_height, block) in blocks.into_iter() {
                let transaction = block.transaction().into_owned();
                let result =
                    store.append_transaction(transaction.operation, transaction.memo, block_height, block.timestamp());

                if let Err(err) = result {
                    return Err(err);
                }
            }
            store.mark_ledger_sync_complete();

            Ok(blocks_count)
        })
    }
}

fn get_block_height_synced_up_to() -> Option<BlockHeight> {
    STATE.with(|s| s.accounts_store.borrow().get_block_height_synced_up_to())
}

async fn get_blocks(from: BlockHeight, tip_of_chain: BlockHeight) -> Result<Vec<(BlockHeight, Block)>, String> {
    let archive_index_entries = ledger::get_archive_index().await?.entries;

    let (canister_id, range) = determine_canister_for_blocks(from, tip_of_chain, archive_index_entries);

    const MAX_BLOCK_PER_ITERATION: u32 = 1000;
    let count = min((range.end() - range.start() + 1) as u32, MAX_BLOCK_PER_ITERATION);

    let blocks = ledger::get_blocks(canister_id, *range.start(), count).await?;

    let results: Vec<_> = blocks
        .into_iter()
        .enumerate()
        .map(|(index, block)| (range.start() + (index as u64), Block::decode(block).unwrap()))
        .collect();

    Ok(results)
}

fn determine_canister_for_blocks(
    from: BlockHeight,
    tip_of_chain: BlockHeight,
    archive_index_entries: Vec<ArchiveIndexEntry>,
) -> (CanisterId, RangeInclusive<BlockHeight>) {
    for archive_index_entry in archive_index_entries.into_iter().rev() {
        if archive_index_entry.height_to < from {
            break;
        } else if archive_index_entry.height_from > from {
            continue;
        } else {
            let range_start = max(from, archive_index_entry.height_from);
            let range_end = min(tip_of_chain, archive_index_entry.height_to);
            return (
                CanisterId::new(archive_index_entry.canister_id.unwrap()).unwrap(),
                range_start..=range_end,
            );
        }
    }

    (LEDGER_CANISTER_ID, from..=tip_of_chain)
}
