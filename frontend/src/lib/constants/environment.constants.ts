export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";
export const WASM_CANISTER_ID = import.meta.env.VITE_WASM_CANISTER_ID;

export const { ENABLE_SNS }: { ENABLE_SNS: boolean } = JSON.parse(
    import.meta.env.VITE_FEATURE_FLAGS.replace(/\\"/g,"\"") ?? '{"ENABLE_SNS":false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
