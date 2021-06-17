use dfn_core::CanisterId;
use dfn_protobuf::{protobuf, ToProto};
use ic_nns_constants::LEDGER_CANISTER_ID;
use ledger_canister::protobuf::{ArchiveIndexResponse, TipOfChainRequest};
use ledger_canister::{
    AccountBalanceArgs, BlockArg, BlockHeight, BlockRes, CyclesResponse, EncodedBlock,
    GetBlocksArgs, GetBlocksRes, ICPTs, NotifyCanisterArgs, SendArgs, TipOfChainRes,
};

pub async fn send(request: SendArgs) -> Result<BlockHeight, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "send_pb", protobuf, request.to_proto())
        .await
        .map_err(|e| e.1)
}

pub async fn notify(request: NotifyCanisterArgs) -> Result<CyclesResponse, String> {
    dfn_core::call(
        LEDGER_CANISTER_ID,
        "notify_pb",
        protobuf,
        request.to_proto(),
    )
    .await
    .map_err(|e| e.1)
}

pub async fn account_balance(request: AccountBalanceArgs) -> Result<ICPTs, String> {
    dfn_core::call(
        LEDGER_CANISTER_ID,
        "account_balance_pb",
        protobuf,
        request.to_proto(),
    )
    .await
    .map_err(|e| e.1)
}

pub async fn tip_of_chain() -> Result<BlockHeight, String> {
    let response: TipOfChainRes = dfn_core::call(
        LEDGER_CANISTER_ID,
        "tip_of_chain_pb",
        protobuf,
        TipOfChainRequest {},
    )
    .await
    .map_err(|e| e.1)?;

    Ok(response.tip_index)
}

pub async fn get_archive_index() -> Result<ArchiveIndexResponse, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "get_archive_index_pb", protobuf, ())
        .await
        .map_err(|e| e.1)
}

pub async fn get_blocks(
    canister_id: CanisterId,
    from: BlockHeight,
    length: u32,
) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksRes = dfn_core::call(
        canister_id,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs::new(from, length as usize),
    )
    .await
    .map_err(|e| e.1)?;

    Ok(response.0?)
}

pub async fn get_block(
    canister_id: CanisterId,
    block_height: BlockHeight,
) -> Result<EncodedBlock, String> {
    let method_name = if canister_id == LEDGER_CANISTER_ID {
        "block_pb"
    } else {
        "get_block_pb"
    };

    let response: BlockRes =
        dfn_core::call(canister_id, method_name, protobuf, BlockArg(block_height))
            .await
            .map_err(|e| e.1)?;

    let block = response
        .0
        .ok_or("Block not found")?
        .map_err(|c| format!("Block is held in canister: {}", c))?;

    Ok(block)
}
