use icp_ledger::Memo;

pub const NANOS_PER_UNIT: u64 = 1_000_000_000;

pub const MEMO_CREATE_CANISTER: Memo = Memo(0x4145_5243); // == 'CREA'
pub const MEMO_TOP_UP_CANISTER: Memo = Memo(0x5055_5054); // == 'TPUP'
