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

// TODO: environment variables for ckBTC canister IDs
export const CKBTC_MINTER_CANISTER_ID = Principal.fromText(
  "q3fc5-haaaa-aaaaa-aaahq-cai"
);
export const CKBTC_LEDGER_CANISTER_ID = Principal.fromText(
  "q4eej-kyaaa-aaaaa-aaaha-cai"
);
export const CKBTC_INDEX_CANISTER_ID = Principal.fromText(
  "si2b5-pyaaa-aaaaa-aaaja-cai"
);
