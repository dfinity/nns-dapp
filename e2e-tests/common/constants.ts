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

export const REDIRECT_TO_LEGACY: RedirectToLegacy = ((
  env = RedirectToLegacy.prod
) => env)(RedirectToLegacy[process.env.REDIRECT_TO_LEGACY as string]);

export const NNS_DAPP_URL: string = process.env.NNS_DAPP_URL ?? "http://localhost:8080";
