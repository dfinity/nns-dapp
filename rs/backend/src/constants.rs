use icp_ledger::Memo;

pub const E8S_PER_UNIT: u64 = 100_000_000;
pub const NANOS_PER_UNIT: u64 = 1_000_000_000;

pub const MEMO_CREATE_CANISTER: Memo = Memo(0x4145_5243); // == 'CREA'
