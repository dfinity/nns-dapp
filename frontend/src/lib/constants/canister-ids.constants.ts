import { Principal } from "@dfinity/principal";

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

// TVL Canister ID on mainnet. Use for readonly.

export const TVL_CANISTER_ID = Principal.fromText(
  "ewh3f-3qaaa-aaaap-aazjq-cai"
);
