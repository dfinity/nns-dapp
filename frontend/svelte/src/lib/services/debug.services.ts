import { get } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import { initDebugStore } from "../stores/debug.store";
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

/**
 * 1. generates anonymized version of stores state
 * 2. log it in the dev console
 * 3. generates a json file with logged context
 */
export const generateDebugLog = async (safeToFile: boolean) => {
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

  if (safeToFile) {
    saveToJSONFile({
      blob: new Blob([anonymizedStateAsText]),
      filename: `${date}_nns-local-state.json`,
    });
  }
};
