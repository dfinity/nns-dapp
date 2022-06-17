export enum AppPath {
  Authentication = "/",
  Accounts = "/#/accounts",
  Neurons = "/#/neurons",
  Proposals = "/#/proposals",
  Canisters = "/#/canisters",
  Wallet = "/#/wallet",
  ProposalDetail = "/#/proposal",
  NeuronDetail = "/#/neuron",
  CanisterDetail = "/#/canister",
}

// See the [README.md](../../../../../README.md) for when each tab should be shown in svelte.
export const SHOW_ACCOUNTS_ROUTE = [
  "svelte",
  "both",
  "prod",
  "staging",
].includes(process.env.REDIRECT_TO_LEGACY as string);
export const SHOW_NEURONS_ROUTE = [
  "svelte",
  "both",
  "prod",
  "staging",
].includes(process.env.REDIRECT_TO_LEGACY as string);
export const SHOW_PROPOSALS_ROUTE = [
  "svelte",
  "both",
  "prod",
  "staging",
].includes(process.env.REDIRECT_TO_LEGACY as string);
export const SHOW_CANISTERS_ROUTE = [
  "svelte",
  "both",
  "prod",
  "staging",
].includes(process.env.REDIRECT_TO_LEGACY as string);
export const SHOW_ANY_TABS =
  SHOW_ACCOUNTS_ROUTE ||
  SHOW_ACCOUNTS_ROUTE ||
  SHOW_PROPOSALS_ROUTE ||
  SHOW_CANISTERS_ROUTE;
