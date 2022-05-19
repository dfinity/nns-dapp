import { derived, get, type Readable, type Writable } from "svelte/store";
import type { AddAccountStore } from "../types/add-account.context";
import type { HardwareWalletNeuronsStore } from "../types/hardware-wallet-neurons.context";
import type { SelectedAccountStore } from "../types/selected-account.context";
import type { TransactionStore } from "../types/transaction.context";
import { accountsStore } from "./accounts.store";
import { canistersStore } from "./canisters.store";
import { knownNeuronsStore } from "./knownNeurons.store";
import { neuronsStore } from "./neurons.store";
import {
  proposalIdStore,
  proposalInfoStore,
  proposalsFiltersStore,
  proposalsStore,
  votingNeuronSelectStore,
} from "./proposals.store";
import { routeStore } from "./route.store";
import { toastsStore } from "./toasts.store";

const createDerivedStore = <T>(store: Writable<T>): Readable<T> =>
  derived(store, (store) => store);

let addAccountStore: Readable<AddAccountStore>;
export const debugAddAccountStore = (store: Writable<AddAccountStore>) =>
  (addAccountStore = createDerivedStore(store));

let hardwareWalletNeuronsStore: Readable<HardwareWalletNeuronsStore>;
export const debugHardwareWalletNeuronsStore = (
  store: Writable<HardwareWalletNeuronsStore>
) => (hardwareWalletNeuronsStore = createDerivedStore(store));

let newTransactionStore: Readable<TransactionStore>;
export const debugNewTransactionStore = (store: Writable<TransactionStore>) =>
  (newTransactionStore = createDerivedStore(store));

let selectedAccountStore: Readable<SelectedAccountStore>;
export const debugSelectedAccountStore = (
  store: Writable<SelectedAccountStore>
) => (selectedAccountStore = createDerivedStore(store));

const initDebugStore = () =>
  derived(
    [
      routeStore,
      accountsStore,
      neuronsStore,
      knownNeuronsStore,
      canistersStore,
      proposalsStore,
      proposalsFiltersStore,
      proposalIdStore,
      proposalInfoStore,
      votingNeuronSelectStore,
      toastsStore,
      addAccountStore,
      hardwareWalletNeuronsStore,
      newTransactionStore,
      selectedAccountStore,
    ],
    ([
      $routeStore,
      $accountsStore,
      $neuronsStore,
      $knownNeuronsStore,
      $canistersStore,
      $proposalsStore,
      $proposalsFiltersStore,
      $proposalIdStore,
      $proposalInfoStore,
      $votingNeuronSelectStore,
      $toastsStore,
      $addAccountStore,
      $hardwareWalletNeuronsStore,
      $newTransactionStore,
      $selectedAccountStore,
    ]) => ({
      route: $routeStore,
      accounts: $accountsStore,
      neurons: $neuronsStore,
      knownNeurons: $knownNeuronsStore,
      canisters: $canistersStore,
      proposals: $proposalsStore,
      proposalsFilters: $proposalsFiltersStore,
      proposalId: $proposalIdStore,
      proposalInfo: $proposalInfoStore,
      votingNeuronSelect: $votingNeuronSelectStore,
      toasts: $toastsStore,
      addAccount: $addAccountStore,
      hardwareWalletNeurons: $hardwareWalletNeuronsStore,
      newTransaction: $newTransactionStore,
      selectedAccount: $selectedAccountStore,
    })
  );

globalThis._log = () => {
  const debugStore = initDebugStore();
  const stores = get(debugStore);
  const res = {
    route: stores.route,
    accounts: stores.accounts,
    neurons: stores.neurons,
    knownNeurons: stores.knownNeurons,
    canisters: stores.canisters,
    proposals: stores.proposals,
    proposalsFilters: stores.proposalsFilters,
    proposalId: stores.proposalId,
    proposalInfo: stores.proposalInfo,
    votingNeuronSelect: stores.votingNeuronSelect,
    toasts: stores.toasts,
    addAccount: stores.addAccount,
    hardwareWalletNeurons: stores.hardwareWalletNeurons,
    newTransaction: stores.newTransaction,
    selectedAccount: stores.selectedAccount,
  };

  return res;
  // console.log(stringifyJson(res, { indentation: 2 }));
};
