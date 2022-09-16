export enum AppPath {
  Authentication = "/",
  LegacyAccounts = "/#/accounts",
  Accounts = "/#/u/:rootCanisterId/accounts",
  LegacyNeurons = "/#/neurons",
  Neurons = "/#/u/:rootCanisterId/neurons",
  Proposals = "/#/proposals",
  Canisters = "/#/canisters",
  Wallet = "/#/wallet",
  ProposalDetail = "/#/proposal",
  LegacyNeuronDetail = "/#/neuron",
  CanisterDetail = "/#/canister",
  Launchpad = "/#/launchpad",
  ProjectDetail = "/#/u",
  NeuronDetail = "/#/u/:rootCanisterId/neuron",
}

export const CONTEXT_PATH = "/#/u";
