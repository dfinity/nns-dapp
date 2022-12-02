import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { AddAccountStore } from "$lib/types/add-account.context";
import type { SelectCanisterDetailsStore } from "$lib/types/canister-detail.context";
import type { ProjectDetailStore } from "$lib/types/project-detail.context";
import type { SelectedProposalStore } from "$lib/types/selected-proposal.context";
import type { SelectedSnsNeuronStore } from "$lib/types/sns-neuron-detail.context";
import type { WalletStore } from "$lib/types/wallet.context";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import {
  derived,
  readable,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import { accountsStore } from "./accounts.store";
import { canistersStore } from "./canisters.store";
import { knownNeuronsStore } from "./knownNeurons.store";
import { neuronsStore } from "./neurons.store";
import { projectsStore } from "./projects.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "./proposals.store";
import { snsAccountsStore } from "./sns-accounts.store";
import { snsFunctionsStore } from "./sns-functions.store";
import { snsNeuronsStore } from "./sns-neurons.store";
import { snsTransactionsStore } from "./sns-transactions.store";
import { transactionsFeesStore } from "./transaction-fees.store";
import { voteRegistrationStore } from "./vote-registration.store";

const createDerivedStore = <T>(store: Writable<T>): Readable<T> =>
  derived(store, (store) => store);

let addAccountStore: Readable<AddAccountStore>;
export const debugAddAccountStore = (store: Writable<AddAccountStore>) =>
  (addAccountStore = createDerivedStore(store));

// Context stores might not be initialized when debugger is called.
// Therefore, we need to initialize them here.
let walletStore: Readable<WalletStore> = readable({
  account: undefined,
  neurons: [],
});
export const debugSelectedAccountStore = (store: Writable<WalletStore>) =>
  (walletStore = createDerivedStore(store));
let selectedProposalStore: Readable<SelectedProposalStore> = readable({
  proposalId: undefined,
  proposal: undefined,
});
export const debugSelectedProposalStore = (
  store: Writable<SelectedProposalStore>
) => (selectedProposalStore = createDerivedStore(store));
let selectedCanisterStore: Readable<SelectCanisterDetailsStore> = readable({
  info: undefined,
  details: undefined,
  controller: undefined,
  modal: undefined,
  selectedController: undefined,
});
export const debugSelectedCanisterStore = (
  store: Writable<SelectCanisterDetailsStore>
) => (selectedCanisterStore = createDerivedStore(store));
let selectedProjectStore: Readable<ProjectDetailStore> = readable({
  summary: null,
  swapCommitment: null,
});
export const debugSelectedProjectStore = (
  store: Writable<ProjectDetailStore>
) => (selectedProjectStore = createDerivedStore(store));
let selectedSnsNeuronStore: Readable<SelectedSnsNeuronStore> = readable({
  selected: undefined,
  neuron: undefined,
});
export const debugSelectedSnsNeuronStore = (
  store: Writable<SelectedSnsNeuronStore>
) => (selectedSnsNeuronStore = createDerivedStore(store));
const transactionsStore = writable<Transaction[] | undefined>(undefined);
export const debugTransactions = (transactions: Transaction[] | undefined) => {
  transactionsStore.set(transactions);
};

/**
 * Collects state of all available stores (also from context)
 */
export const initDebugStore = () =>
  derived(
    [
      // TODO (L2-611): anonymize wallet id and neuron ids
      busyStore,
      accountsStore,
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
      snsTransactionsStore,
      selectedSnsNeuronStore,
      transactionsStore,
      projectsStore,
      snsFunctionsStore,
      transactionsFeesStore,
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
      snsTransactionsStore: $snsTransactionsStore,
      selectedSnsNeuronStore: $selectedSnsNeuronStore,
      transactionsStore: $transactionsStore,
      projectsStore: $projectsStore,
      snsFunctionsStore: $snsFunctionsStore,
      transactionsFeesStore: $transactionsFeesStore,
    })
  );
