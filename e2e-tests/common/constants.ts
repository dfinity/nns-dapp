import { getRequiredEnvVar, getRequiredEnvEnum } from "../../config.mjs";

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

export const REDIRECT_TO_LEGACY: RedirectToLegacy = (getRequiredEnvEnum(
  "REDIRECT_TO_LEGACY",
  RedirectToLegacy
)) as RedirectToLegacy;
export const NNS_DAPP_URL: string = getRequiredEnvVar("OWN_CANISTER_URL");
