use dfn_core::CanisterId;
use dfn_protobuf::protobuf;
use ic_ledger_core::block::EncodedBlock;
use icp_ledger::protobuf::get_blocks_response::GetBlocksContent;
use icp_ledger::protobuf::GetBlocksResponse as GetBlocksResponsePb;
use icp_ledger::{BlockIndex, GetBlocksArgs};

#[allow(dead_code)]
pub async fn get_blocks(canister_id: CanisterId, from: BlockIndex, length: u32) -> Result<Vec<EncodedBlock>, String> {
    let response: GetBlocksResponsePb = dfn_core::call(
        canister_id,
        "get_blocks_pb",
        protobuf,
        GetBlocksArgs {
            start: from,
            length: u64::from(length),
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
