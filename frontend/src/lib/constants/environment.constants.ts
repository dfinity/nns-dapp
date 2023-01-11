export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";
export const WASM_CANISTER_ID = import.meta.env.VITE_WASM_CANISTER_ID;

interface FEATURE_FLAGS {
  ENABLE_SNS_2: boolean;
  ENABLE_SNS_VOTING: boolean;
}

export const { ENABLE_SNS_2, ENABLE_SNS_VOTING }: FEATURE_FLAGS = JSON.parse(
  import.meta.env.VITE_FEATURE_FLAGS.replace(/\\"/g, '"') ??
    '{"ENABLE_SNS_2":false,"ENABLE_SNS_VOTING": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
