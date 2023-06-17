import { getRequiredEnvVar } from "./config";

export enum RouteHash {
  Accounts = "#/accounts",
  Neurons = "#/neurons",
  Proposals = "#/proposals",
  Canisters = "#/canisters",
}
export enum FrontendPath {
  Flutter = "/",
  Svelte = "/v2/",
}
export enum RedirectToLegacy {
  prod = "prod",
  staging = "staging",
  flutter = "flutter",
  svelte = "svelte",
  both = "both",
}

export const NNS_DAPP_URL: string = getRequiredEnvVar("VITE_OWN_CANISTER_URL");
export const DFX_NETWORK: string = getRequiredEnvVar("VITE_DFX_NETWORK");

export const SECONDS_IN_DAY = 60 * 60 * 24;
