use dfn_protobuf::protobuf;
use ic_nns_constants::LEDGER_CANISTER_ID;
use ledger_canister::{BlockHeight, EncodedBlock, GetBlocksArgs, GetBlocksRes, TipOfChainRes};
use ledger_canister::protobuf::TipOfChainRequest;

pub async fn tip_of_chain() -> Result<BlockHeight, String> {
    let response: TipOfChainRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "tip_of_chain_pb",
        protobuf,
        TipOfChainRequest {}).await.map_err(|e| e.1)?;

    Ok(response.tip_index)
}

pub async fn get_blocks(from: BlockHeight, length: u32) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs::new(from, length as usize)).await.map_err(|e| e.1)?;

    Ok(response.0?)
}