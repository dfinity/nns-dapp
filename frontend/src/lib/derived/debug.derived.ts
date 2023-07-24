import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import { canistersStore } from "$lib/stores/canisters.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import {
  voteRegistrationStore,
  votingNeuronSelectStore,
} from "$lib/stores/vote-registration.store";
import type { AddAccountStore } from "$lib/types/add-account.context";
import type { SelectCanisterDetailsStore } from "$lib/types/canister-detail.context";
import type { ProjectDetailStore } from "$lib/types/project-detail.context";
import type { SelectedProposalStore } from "$lib/types/selected-proposal.context";
import type { SelectedSnsNeuronStore } from "$lib/types/sns-neuron-detail.context";
import type { WalletStore } from "$lib/types/wallet.context";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import type { SnsProposalData } from "@dfinity/sns";
import { derived, readable, writable, type Readable } from "svelte/store";

const createDerivedStore = <T>(store: Readable<T>): Readable<T> =>
  derived(store, (store) => store);

let addAccountStore: Readable<AddAccountStore>;
export const debugAddAccountStore = (store: Readable<AddAccountStore>) =>
  (addAccountStore = createDerivedStore(store));

// Context stores might not be initialized when debugger is called.
// Therefore, we need to initialize them here.
let walletStore: Readable<WalletStore> = readable({
  account: undefined,
  neurons: [],
});
export const debugSelectedAccountStore = (store: Readable<WalletStore>) =>
  (walletStore = createDerivedStore(store));
let selectedProposalStore: Readable<SelectedProposalStore> = readable({
  proposalId: undefined,
  proposal: undefined,
});
export const debugSelectedProposalStore = (
  store: Readable<SelectedProposalStore>
) => (selectedProposalStore = createDerivedStore(store));
let selectedCanisterStore: Readable<SelectCanisterDetailsStore> = readable({
  info: undefined,
  details: undefined,
  controller: undefined,
  modal: undefined,
  selectedController: undefined,
});
export const debugSelectedCanisterStore = (
  store: Readable<SelectCanisterDetailsStore>
) => (selectedCanisterStore = createDerivedStore(store));
let selectedProjectStore: Readable<ProjectDetailStore> = readable({
  summary: null,
  swapCommitment: null,
});
export const debugSelectedProjectStore = (
  store: Readable<ProjectDetailStore>
) => (selectedProjectStore = createDerivedStore(store));
let selectedSnsNeuronStore: Readable<SelectedSnsNeuronStore> = readable({
  selected: undefined,
  neuron: undefined,
});
export const debugSelectedSnsNeuronStore = (
  store: Readable<SelectedSnsNeuronStore>
) => (selectedSnsNeuronStore = createDerivedStore(store));
const transactionsStore = writable<Transaction[] | undefined>(undefined);
export const debugTransactions = (transactions: Transaction[] | undefined) => {
  transactionsStore.set(transactions);
};
const snsProposalStore = writable<SnsProposalData | undefined>(undefined);
export const debugSnsProposalStore = (
  proposal: SnsProposalData | undefined
) => {
  snsProposalStore.set(proposal);
};

/**
 * Collects state of all available stores (also from context)
 */
export const initDebugStore = () =>
  derived(
    [
      // TODO (L2-611): anonymize wallet id and neuron ids
      busyStore,
      icpAccountsStore,
      neuronsStore,
      knownNeuronsStore,
      canistersStore,
      proposalsStore,
      proposalsFiltersStore,
      votingNeuronSelectStore,
      proposalPayloadsStore,
      toastsStore,
      addAccountStore,
      walletStore,
      selectedCanisterStore,
      selectedProposalStore,
      voteRegistrationStore,
      selectedProjectStore,
      snsNeuronsStore,
      snsAccountsStore,
      icrcTransactionsStore,
      selectedSnsNeuronStore,
      transactionsStore,
      snsProjectsStore,
      snsFunctionsStore,
      transactionsFeesStore,
      snsProposalStore,
    ],
    ([
      $busyStore,
      $accountsStore,
      $neuronsStore,
      $knownNeuronsStore,
      $canistersStore,
      $proposalsStore,
      $proposalsFiltersStore,
      $votingNeuronSelectStore,
      $proposalPayloadsStore,
      $toastsStore,
      $addAccountStore,
      $selectedAccountStore,
      $selectedCanisterStore,
      $selectedProposalStore,
      $voteRegistrationStore,
      $selectedProjectStore,
      $snsNeuronsStore,
      $snsAccountsStore,
      $snsTransactionsStore,
      $selectedSnsNeuronStore,
      $transactionsStore,
      $projectsStore,
      $snsFunctionsStore,
      $transactionsFeesStore,
      $snsProposalStore,
    ]) => ({
      busy: $busyStore,
      accounts: $accountsStore,
      neurons: $neuronsStore,
      knownNeurons: $knownNeuronsStore,
      canisters: $canistersStore,
      proposals: $proposalsStore,
      proposalsFilters: $proposalsFiltersStore,
      votingNeuronSelect: $votingNeuronSelectStore,
      proposalPayloads: $proposalPayloadsStore,
      toasts: $toastsStore,
      addAccount: $addAccountStore,
      selectedAccount: $selectedAccountStore,
      selectedCanister: $selectedCanisterStore,
      selectedProposal: $selectedProposalStore,
      voteRegistrationStore: $voteRegistrationStore,
      selectedProject: $selectedProjectStore,
      snsNeurons: $snsNeuronsStore,
      snsAccounts: $snsAccountsStore,
      snsTransactions: $snsTransactionsStore,
      selectedSnsNeuron: $selectedSnsNeuronStore,
      transactions: $transactionsStore,
      snsProposal: $snsProposalStore,
      projects: $projectsStore,
      snsFunctions: $snsFunctionsStore,
      transactionsFees: $transactionsFeesStore,
    })
  );
