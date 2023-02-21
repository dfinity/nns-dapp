import { Principal } from "@dfinity/principal";
import { CKBTC_LEDGER_CANISTER_ID } from "./ckbtc-canister-ids.constants";

export const OWN_CANISTER_ID_TEXT = import.meta.env
  .VITE_OWN_CANISTER_ID as string;
export const OWN_CANISTER_ID = Principal.fromText(OWN_CANISTER_ID_TEXT);
export const LEDGER_CANISTER_ID = Principal.fromText(
  import.meta.env.VITE_LEDGER_CANISTER_ID as string
);
export const GOVERNANCE_CANISTER_ID = Principal.fromText(
  import.meta.env.VITE_GOVERNANCE_CANISTER_ID as string
);
export const CYCLES_MINTING_CANISTER_ID = Principal.fromText(
  import.meta.env.VITE_CYCLES_MINTING_CANISTER_ID as string
);
export const WASM_CANISTER_ID = import.meta.env.VITE_WASM_CANISTER_ID;

export const CKBTC_UNIVERSE_CANISTER_ID = CKBTC_LEDGER_CANISTER_ID;
