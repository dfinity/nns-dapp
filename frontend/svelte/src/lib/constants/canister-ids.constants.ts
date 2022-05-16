import { Principal } from "@dfinity/principal";

export const OWN_CANISTER_ID = Principal.fromText(
  process.env.OWN_CANISTER_ID as string
);
export const LEDGER_CANISTER_ID = Principal.fromText(
  process.env.LEDGER_CANISTER_ID as string
);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
  process.env.GOVERNANCE_CANISTER_ID as string
);
