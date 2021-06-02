use dfn_core::CanisterId;
use dfn_protobuf::protobuf;
use ic_nns_constants::LEDGER_CANISTER_ID;
use ledger_canister::{BlockHeight, EncodedBlock, GetBlocksArgs, GetBlocksRes, TipOfChainRes};
use ledger_canister::protobuf::{TipOfChainRequest, ArchiveIndexResponse};

pub async fn tip_of_chain() -> Result<BlockHeight, String> {
    let response: TipOfChainRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "tip_of_chain_pb",
        protobuf,
        TipOfChainRequest {}).await.map_err(|e| e.1)?;

    Ok(response.tip_index)
}

pub async fn get_archive_index() -> Result<ArchiveIndexResponse, String> {
    let response: ArchiveIndexResponse = dfn_core::call(
        LEDGER_CANISTER_ID,
        "get_archive_index_pb",
        protobuf,
        ()).await.map_err(|e| e.1)?;

    Ok(response)
}

pub async fn get_blocks(canister_id: CanisterId, from: BlockHeight, length: u32) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksRes = dfn_core::call(
        canister_id,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs::new(from, length as usize)).await.map_err(|e| e.1)?;

    Ok(response.0?)
}