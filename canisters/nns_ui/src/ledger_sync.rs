use crate::state::STATE;
use dfn_protobuf::protobuf;
use ic_nns_constants::LEDGER_CANISTER_ID;
use lazy_static::lazy_static;
use ledger_canister::{BlockHeight, GetBlocksRes, Block, GetBlocksArgs, TipOfChainRes};
use ledger_canister::protobuf::TipOfChainRequest;
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
    let next_block_height_required = store.get_next_required_block_height();
    let latest_block_height = get_latest_block_height().await?;

    if latest_block_height < next_block_height_required {
        Ok(0)
    } else {
        match get_blocks(next_block_height_required, latest_block_height).await {
            Ok(blocks) => {
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
            Err(e) => Err(e),
        }
    }
}

async fn get_latest_block_height() -> Result<BlockHeight, String> {
    let response: TipOfChainRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "tip_of_chain_pb",
        protobuf,
        TipOfChainRequest {}).await.map_err(|e| e.1)?;

    Ok(response.tip_index)
}

async fn get_blocks(from: BlockHeight, to: BlockHeight) -> Result<Vec<(BlockHeight, Block)>, String> {
    let response: GetBlocksRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs::new(from, (to - from) as usize + 1usize)).await.map_err(|e| e.1)?;

    let blocks = response.0?;

    Ok(blocks
        .into_iter()
        .enumerate()
        .map(|(index, block)| (from + (index as u64), block.decode().unwrap()))
        .collect())
}
