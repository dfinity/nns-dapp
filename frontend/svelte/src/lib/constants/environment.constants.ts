export const DFX_NETWORK: string = String(process.env.DFX_NETWORK);
export const HOST: string = process.env.HOST as string;
export const ROLLUP_WATCH: boolean = process.env.ROLLUP_WATCH === "true";
export const FETCH_ROOT_KEY: boolean = process.env.FETCH_ROOT_KEY === "true";
export const ENABLE_NEW_SPAWN_FEATURE: boolean =
  process.env.ENABLE_NEW_SPAWN_FEATURE === "true";
export const WASM_CANISTER_ID: string = String(process.env.WASM_CANISTER_ID);
export const ENABLE_SNS_NEURONS: boolean =
  process.env.ENABLE_SNS_NEURONS === "true";
export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
