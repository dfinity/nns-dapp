use dfn_core::CanisterId;
use dfn_protobuf::{protobuf, ToProto};
use ic_nns_constants::LEDGER_CANISTER_ID;
use ledger_canister::protobuf::{ArchiveIndexResponse, TipOfChainRequest};
use ledger_canister::{
    AccountBalanceArgs, BlockHeight, EncodedBlock, GetBlocksArgs, GetBlocksRes, SendArgs, TipOfChainRes, Tokens,
};

pub async fn send(request: SendArgs) -> Result<BlockHeight, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "send_pb", protobuf, request.into_proto())
        .await
        .map_err(|e| e.1)
}

pub async fn account_balance(request: AccountBalanceArgs) -> Result<Tokens, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "account_balance_pb", protobuf, request.into_proto())
        .await
        .map_err(|e| e.1)
}

pub async fn tip_of_chain() -> Result<BlockHeight, String> {
    let response: TipOfChainRes = dfn_core::call(LEDGER_CANISTER_ID, "tip_of_chain_pb", protobuf, TipOfChainRequest {})
        .await
        .map_err(|e| e.1)?;

    Ok(response.tip_index)
}

pub async fn get_archive_index() -> Result<ArchiveIndexResponse, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "get_archive_index_pb", protobuf, ())
        .await
        .map_err(|e| e.1)
}

pub async fn get_blocks(canister_id: CanisterId, from: BlockHeight, length: u32) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksRes = dfn_core::call(
        canister_id,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs {
            start: from,
            length: length as usize,
        },
    )
    .await
    .map_err(|e| e.1)?;

    Ok(response.0?)
}
