import { ENABLE_SNS } from "./environment.constants";

export enum AppPath {
  Authentication = "/",
  LegacyAccounts = "/#/accounts",
  Accounts = "/#/u/:rootCanisterId/accounts",
  LegacyNeurons = "/#/neurons",
  Neurons = "/#/u/:rootCanisterId/neurons",
  Proposals = "/#/proposals",
  Canisters = "/#/canisters",
  LegacyWallet = "/#/wallet",
  Wallet = "/#/u/:rootCanisterId/wallet",
  ProposalDetail = "/#/proposal",
  LegacyNeuronDetail = "/#/neuron",
  CanisterDetail = "/#/canister",
  Launchpad = "/#/launchpad",
  ProjectDetail = "/#/u",
  NeuronDetail = "/#/u/:rootCanisterId/neuron",
}

export const paths = {
  neuronDetail: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/neuron`
      : AppPath.LegacyNeuronDetail,
  neurons: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/neurons`
      : AppPath.LegacyNeurons,
  accounts: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/accounts`
      : AppPath.LegacyAccounts,
  wallet: (rootCanisterId: string) =>
    ENABLE_SNS
      ? `${CONTEXT_PATH}/${rootCanisterId}/wallet`
      : AppPath.LegacyWallet,
};

export const CONTEXT_PATH = "/#/u";
