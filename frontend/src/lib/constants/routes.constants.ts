export enum AppPathLegacy {
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

export enum AppPath {
  Login = "/",
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
