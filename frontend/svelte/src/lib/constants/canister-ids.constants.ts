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
export const CMC_CANISTER_ID = Principal.fromText(
  process.env.CMC_CANISTER_ID as string
);
// From: https://smartcontracts.org/docs/current/references/ic-interface-spec/#ic-management-canister
// The IC management canister is just a facade; it does not actually exist as a canister
// The IC management canister address is "aaaaa-aa" (i.e. the empty blob).
export const IC_MANAGEMENT_CANISTER_ID = Principal.from("aaaaa-aa");
