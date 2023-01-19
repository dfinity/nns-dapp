export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";
export const WASM_CANISTER_ID = import.meta.env.VITE_WASM_CANISTER_ID;

// TODO: Add as env var https://dfinity.atlassian.net/browse/GIX-1245
export const CACHING_CANISTER_URL =
  import.meta.env.CACHING_CANISTER_URL ??
  (DFX_NETWORK === "small12"
    ? "https://5v72r-4aaaa-aaaaa-aabnq-cai.raw.small12.dfinity.network"
    : undefined);

interface FEATURE_FLAGS {
  ENABLE_SNS_2: boolean;
  ENABLE_SNS_VOTING: boolean;
  ENABLE_SNS_CACHING: boolean;
}

export const {
  ENABLE_SNS_2,
  ENABLE_SNS_VOTING,
  ENABLE_SNS_CACHING,
}: FEATURE_FLAGS = JSON.parse(
  import.meta.env.VITE_FEATURE_FLAGS.replace(/\\"/g, '"') ??
    '{"ENABLE_SNS_2":false,"ENABLE_SNS_VOTING": false, "ENABLE_SNS_CACHING": false}'
);

export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");
