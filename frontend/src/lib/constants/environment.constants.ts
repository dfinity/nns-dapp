export const DFX_NETWORK: string = import.meta.env.VITE_DFX_NETWORK;
export const HOST: string = import.meta.env.VITE_HOST as string;
export const ROLLUP_WATCH: boolean =
  import.meta.env.VITE_ROLLUP_WATCH === "true";
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";
export const WASM_CANISTER_ID: string = import.meta.env.VITE_WASM_CANISTER_ID;

export const ENABLE_SNS: string = import.meta.env
  .VITE_FEATURE_FLAGS_ENABLE_SNS as string;
export const VOTING_UI: string = import.meta.env
  .VITE_FEATURE_FLAGS_VOTING_UI as "legacy" | "modern";

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
