import { derived, type Readable, type Writable } from "svelte/store";
import type { AddAccountStore } from "../types/add-account.context";
import type { SelectCanisterDetailsStore } from "../types/canister-detail.context";
import type { HardwareWalletNeuronsStore } from "../types/hardware-wallet-neurons.context";
import type { SelectedAccountStore } from "../types/selected-account.context";
import type { SelectedProposalStore } from "../types/selected-proposal.context";
import type { TransactionStore } from "../types/transaction.context";
import { accountsStore } from "./accounts.store";
import { busyStore } from "./busy.store";
import { canistersStore } from "./canisters.store";
import { knownNeuronsStore } from "./knownNeurons.store";
import { neuronsStore } from "./neurons.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "./proposals.store";
import { toastsStore } from "./toasts.store";
import { voteInProgressStore } from "./voting.store";

const createDerivedStore = <T>(store: Writable<T>): Readable<T> =>
  derived(store, (store) => store);

let addAccountStore: Readable<AddAccountStore>;
export const debugAddAccountStore = (store: Writable<AddAccountStore>) =>
  (addAccountStore = createDerivedStore(store));

let hardwareWalletNeuronsStore: Readable<HardwareWalletNeuronsStore>;
export const debugHardwareWalletNeuronsStore = (
  store: Writable<HardwareWalletNeuronsStore>
) => (hardwareWalletNeuronsStore = createDerivedStore(store));

let transactionStore: Readable<TransactionStore>;
export const debugTransactionStore = (store: Writable<TransactionStore>) =>
  (transactionStore = createDerivedStore(store));

let selectedAccountStore: Readable<SelectedAccountStore>;
export const debugSelectedAccountStore = (
  store: Writable<SelectedAccountStore>
) => (selectedAccountStore = createDerivedStore(store));
let selectedProposalStore: Readable<SelectedProposalStore>;
export const debugSelectedProposalStore = (
  store: Writable<SelectedProposalStore>
) => (selectedProposalStore = createDerivedStore(store));
let selectedCanisterStore: Readable<SelectCanisterDetailsStore>;
export const debugSelectedCanisterStore = (
  store: Writable<SelectCanisterDetailsStore>
) => (selectedCanisterStore = createDerivedStore(store));

/**
 * Collects state of all available stores (also from context)
 */
export const initDebugStore = () =>
  derived(
    [
      // TODO (L2-611): anonymize wallet id and neuron ids
      // TODO: (L2-683): add routeStore
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
      hardwareWalletNeuronsStore,
      transactionStore,
      selectedAccountStore,
      selectedCanisterStore,
      selectedProposalStore,
      voteInProgressStore,
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
      $hardwareWalletNeuronsStore,
      $transactionStore,
      $selectedAccountStore,
      $selectedCanisterStore,
      $selectedProposalStore,
      $voteInProgressStore,
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
      hardwareWalletNeurons: $hardwareWalletNeuronsStore,
      transaction: $transactionStore,
      selectedAccount: $selectedAccountStore,
      selectedCanister: $selectedCanisterStore,
      selectedProposal: $selectedProposalStore,
      voteInProgressStore: $voteInProgressStore,
    })
  );
