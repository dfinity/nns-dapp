use dfn_core::CanisterId;
use dfn_protobuf::{protobuf, ToProto};
use ic_ledger_core::block::EncodedBlock;
use ic_nns_constants::LEDGER_CANISTER_ID;
use icp_ledger::protobuf::get_blocks_response::GetBlocksContent;
use icp_ledger::protobuf::{
    ArchiveIndexResponse as ArchiveIndexResponsePb, GetBlocksResponse as GetBlocksResponsePb,
    TipOfChainRequest as TipOfChainRequestPb, TipOfChainResponse as TipOfChainResponsePb,
};
use icp_ledger::{AccountBalanceArgs, BlockIndex, GetBlocksArgs, SendArgs, Tokens};

pub async fn send(request: SendArgs) -> Result<BlockIndex, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "send_pb", protobuf, request.into_proto())
        .await
        .map_err(|e| e.1)
}

pub async fn account_balance(request: AccountBalanceArgs) -> Result<Tokens, String> {
    let tokens: icp_ledger::protobuf::Tokens =
        dfn_core::call(LEDGER_CANISTER_ID, "account_balance_pb", protobuf, request.into_proto())
            .await
            .map_err(|e| e.1)?;

    Ok(Tokens::from_e8s(tokens.e8s))
}

pub async fn tip_of_chain() -> Result<BlockIndex, String> {
    let response: TipOfChainResponsePb =
        dfn_core::call(LEDGER_CANISTER_ID, "tip_of_chain_pb", protobuf, TipOfChainRequestPb {})
            .await
            .map_err(|e| e.1)?;

    Ok(response.chain_length.map(|c| c.height).unwrap_or_default())
}

pub async fn get_archive_index() -> Result<ArchiveIndexResponsePb, String> {
    dfn_core::call(LEDGER_CANISTER_ID, "get_archive_index_pb", protobuf, ())
        .await
        .map_err(|e| e.1)
}

pub async fn get_blocks(canister_id: CanisterId, from: BlockIndex, length: u32) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksResponsePb = dfn_core::call(
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

    match response.get_blocks_content {
        Some(GetBlocksContent::Blocks(blocks)) => {
            Ok(blocks.blocks.into_iter().map(|b| EncodedBlock::from(b.block)).collect())
        }
        Some(GetBlocksContent::Error(error)) => Err(error),
        None => Ok(Vec::new()),
    }
}
