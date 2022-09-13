export const DFX_NETWORK: string = String(process.env.DFX_NETWORK);
export const HOST: string = process.env.HOST as string;
export const ROLLUP_WATCH: boolean = process.env.ROLLUP_WATCH === "true";
export const FETCH_ROOT_KEY: boolean = process.env.FETCH_ROOT_KEY === "true";
export const WASM_CANISTER_ID: string = String(process.env.WASM_CANISTER_ID);

export const {
  ENABLE_SNS,
  VOTING_UI,
}: { ENABLE_SNS: boolean; VOTING_UI: "legacy" | "modern" } = JSON.parse(
  process.env.FEATURE_FLAGS ?? '{"ENABLE_SNS":false,"VOTING_UI":"legacy"}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
