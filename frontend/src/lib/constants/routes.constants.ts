export enum AppPath {
  Authentication = "/",
  Accounts = "/accounts",
  Wallet = "/wallet",
  Neurons = "/neurons",
  Neuron = "/neuron",
  Proposals = "/proposals",
  Proposal = "/proposal",
  Canisters = "/canisters",
  Canister = "/canister",
  Launchpad = "/launchpad",
  Project = "/project",
}

// SvelteKit uses the group defined in src/routes/(app)/ as part of the routeId. It also prefixes it with /.
export const ROUTE_ID_GROUP_APP = "/(app)";
export const ROUTE_ID_GROUP_UNIVERSE = "/(u)";
export const ROUTE_ID_GROUP_NNS = "/(nns)";
export const ROUTE_ID_GROUP_LIST = "/(list)";
export const ROUTE_ID_GROUP_DETAILS = "/(detail)";

export const ROUTE_ID_GROUPS = [
  ROUTE_ID_GROUP_APP,
  ROUTE_ID_GROUP_UNIVERSE,
  ROUTE_ID_GROUP_NNS,
  ROUTE_ID_GROUP_LIST,
  ROUTE_ID_GROUP_DETAILS,
];

export const UNIVERSE_PARAM = "u";

export const CANISTER_PARAM = "canister";
export const NEURON_PARAM = "neuron";
export const PROJECT_PARAM = "project";
export const PROPOSAL_PARAM = "proposal";
export const ACCOUNT_PARAM = "account";
