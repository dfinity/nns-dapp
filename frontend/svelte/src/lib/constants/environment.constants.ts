export const DFX_NETWORK: string = String(process.env.DFX_NETWORK);
export const HOST: string = process.env.HOST as string;
export const ROLLUP_WATCH: boolean = process.env.ROLLUP_WATCH === "true";
export const FETCH_ROOT_KEY: boolean = process.env.FETCH_ROOT_KEY === "true";
export const IS_TESTNET: boolean =
  DFX_NETWORK !== "mainnet" &&
  FETCH_ROOT_KEY === true &&
  !HOST.includes(".ic0.app");

// Lower case as in SvelteKit
export const browser: boolean = typeof window !== "undefined";
