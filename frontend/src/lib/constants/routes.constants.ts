export enum AppPath {
  Authentication = "/",
  LegacyNeurons = "/#/neurons",
  Neurons = "/#/u/:rootCanisterId/neurons",
  Proposals = "/#/proposals",
  Canisters = "/#/canisters",
  ProposalDetail = "/#/proposal",
  LegacyNeuronDetail = "/#/neuron",
  CanisterDetail = "/#/canister",
  Launchpad = "/#/launchpad",
  ProjectDetail = "/#/u",
  NeuronDetail = "/#/u/:rootCanisterId/neuron",
}

export const CONTEXT_PATH = "/u";

export enum AppRoutes {
  Login = "/",
  Accounts = "/accounts",
  Wallet = "/wallet",
  Neurons = "/neurons",
  NeuronDetail = "/neuron",
  Proposals = "/proposals",
  ProposalDetail = "/proposal",
  Canisters = "/canisters",
  Canister = "/canister",
  Launchpad = "/launchpad",
  Project = "/project",
}
