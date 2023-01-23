export const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK;
export const HOST = import.meta.env.VITE_HOST as string;
export const DEV = import.meta.env.DEV;
export const FETCH_ROOT_KEY: boolean =
  import.meta.env.VITE_FETCH_ROOT_KEY === "true";

// TODO: Add as env var https://dfinity.atlassian.net/browse/GIX-1245
// Local development needs `.raw` to avoid CORS issues for now.
// TODO: Fix CORS issues
export const CACHING_CANISTER_URL =
  import.meta.env.CACHING_CANISTER_URL ??
  (DFX_NETWORK === "small12"
    ? DEV
      ? "https://5v72r-4aaaa-aaaaa-aabnq-cai.raw.small12.testnet.dfinity.network"
      : "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network"
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

// TODO: disable TVL display locally until we use the XCR canister to fetch teh ICP<>USD exchange rate and a certified endpoint to fetch the TVL
export const ENABLE_TVL = !DEV;
