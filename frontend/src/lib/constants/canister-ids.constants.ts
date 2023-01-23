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

export const CKBTC_MINTER_CANISTER_ID = Principal.fromText(
  "ml52i-qqaaa-aaaar-qaaba-cai"
);
export const CKBTC_LEDGER_CANISTER_ID = Principal.fromText(
  "mc6ru-gyaaa-aaaar-qaaaq-cai"
);
