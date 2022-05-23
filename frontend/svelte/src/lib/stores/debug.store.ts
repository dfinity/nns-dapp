import { derived, get, type Readable, type Writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { AddAccountStore } from "../types/add-account.context";
import type { HardwareWalletNeuronsStore } from "../types/hardware-wallet-neurons.context";
import type { SelectedAccountStore } from "../types/selected-account.context";
import type { TransactionStore } from "../types/transaction.context";
import {
  anonymizeAccount,
  anonymizeCanister,
  anonymizeICP,
  anonymizeKnownNeuron,
  anonymizeNeuronInfo,
  anonymizeProposal,
  anonymizeTransaction,
  cutAndAnonymize,
} from "../utils/anonymize.utils";
import { saveToJSONFile } from "../utils/save.utils";
import { mapPromises, stringifyJson } from "../utils/utils";
import { accountsStore } from "./accounts.store";
import { canistersStore } from "./canisters.store";
import { knownNeuronsStore } from "./knownNeurons.store";
import { sortedNeuronStore } from "./neurons.store";
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

let transactionStore: Readable<TransactionStore>;
export const debugTransactionStore = (store: Writable<TransactionStore>) =>
  (transactionStore = createDerivedStore(store));

let selectedAccountStore: Readable<SelectedAccountStore>;
export const debugSelectedAccountStore = (
  store: Writable<SelectedAccountStore>
) => (selectedAccountStore = createDerivedStore(store));

/**
 * Collects state of all available stores (also from context)
 */
const initDebugStore = () =>
  derived(
    [
      routeStore,
      accountsStore,
      sortedNeuronStore,
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
      transactionStore,
      selectedAccountStore,
    ],
    ([
      $routeStore,
      $accountsStore,
      $sortedNeuronStore,
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
      $transactionStore,
      $selectedAccountStore,
    ]) => ({
      route: $routeStore,
      accounts: $accountsStore,
      sortedNeuron: $sortedNeuronStore,
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
      transaction: $transactionStore,
      selectedAccount: $selectedAccountStore,
    })
  );

/**
 * 1. generates anonymized version of stores state
 * 2. log it in the dev console
 * 3. generates a json file with logged context
 */
const logStoreState = async () => {
  const debugStore = initDebugStore();
  const {
    route,
    accounts,
    sortedNeuron,
    knownNeurons,
    canisters,
    proposals,
    proposalsFilters,
    proposalId,
    proposalInfo,
    votingNeuronSelect,
    toasts,
    addAccount,
    hardwareWalletNeurons,
    transaction,
    selectedAccount,
  } = get(debugStore);

  const anonymizedState = {
    route: route,
    accounts: {
      main: await anonymizeAccount(accounts?.main),
      subAccounts: await mapPromises(accounts?.subAccounts, anonymizeAccount),
      hardwareWallets: await mapPromises(
        accounts?.hardwareWallets,
        anonymizeAccount
      ),
    },
    sortedNeuron: await mapPromises(sortedNeuron, anonymizeNeuronInfo),
    knownNeurons: await mapPromises(knownNeurons, anonymizeKnownNeuron),
    canisters: await mapPromises(canisters, anonymizeCanister),
    proposals: {
      proposals: await mapPromises(proposals?.proposals, anonymizeProposal),
      certified: proposals?.certified,
    },
    proposalsFilters: proposalsFilters,
    proposalId: proposalId,
    proposalInfo: proposalInfo,
    votingNeuronSelect: {
      neurons: await mapPromises(
        votingNeuronSelect?.neurons,
        anonymizeNeuronInfo
      ),
      selectedIds: await mapPromises(
        votingNeuronSelect?.selectedIds,
        cutAndAnonymize
      ),
    },
    toasts: toasts,
    addAccount: {
      type: addAccount?.type,
      hardwareWalletName: addAccount?.hardwareWalletName,
    },
    hardwareWalletNeurons,
    transaction: {
      selectedAccount: await anonymizeAccount(transaction?.selectedAccount),
      destinationAddress: await cutAndAnonymize(
        transaction?.destinationAddress
      ),
      amount: await anonymizeICP(transaction?.amount),
    },
    selectedAccount: {
      account: await anonymizeAccount(selectedAccount?.account),
      transactions: await mapPromises(
        selectedAccount?.transactions,
        (transaction: Transaction) =>
          anonymizeTransaction({
            transaction,
            account: selectedAccount?.account,
          })
      ),
    },
  };

  const date = new Date().toJSON().split(".")[0].replace(/:/g, "-");
  const anonymizedStateAsText = stringifyJson(anonymizedState, {
    indentation: 2,
  });
  console.log(date, anonymizedStateAsText);
  // saveToFile(anonymizedStateAsText, `${date}_nns-local-state.json`);
  saveToJSONFile({
    blob: new Blob([anonymizedStateAsText]),
    filename: `${date}_nns-local-state.json`,
  });
};

const saveToFile = (content: string, fileName: string): void => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

/**
 * To not have "nns-state" in the code
 * @returns "nns-state"
 */
const TRIGGER_PHRASE = [101, 116, 97, 116, 115, 45, 115, 110, 110]
  .reverse()
  .map((c) => String.fromCharCode(c))
  .join("");

/**
 * Add console.log with a version that logs the stores on TRIGGER_PHRASE
 */
(() => {
  const originalLog = console.log;
  console.log = function (...args) {
    if (args.length === 1 && args[0] === TRIGGER_PHRASE) {
      logStoreState();
    } else {
      originalLog.apply(this, args);
    }
  };
})();
