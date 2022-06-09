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
 * c - pseudo-anonymised stringified -> console
 * co - original stringified -> console
 * coo - original as object -> console
 * f - pseudo-anonymised -> json file
 * fo - original -> json file
 */
export enum LogType {
  Console = "c",
  ConsoleOriginal = "co",
  ConsoleOriginalObject = "coo",
  File = "f",
  FileOriginal = "fo",
}

const anonymiseStoreState = async () => {
  const debugStore = initDebugStore();
  const {
    busy,
    accounts,
    neurons,
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

  return {
    busy,
    accounts: {
      main: await anonymizeAccount(accounts?.main),
      subAccounts: await mapPromises(accounts?.subAccounts, anonymizeAccount),
      hardwareWallets: await mapPromises(
        accounts?.hardwareWallets,
        anonymizeAccount
      ),
    },
    neurons: {
      neurons: await mapPromises(neurons.neurons ?? [], anonymizeNeuronInfo),
      certified: neurons.certified,
    },
    knownNeurons: await mapPromises(knownNeurons, anonymizeKnownNeuron),
    canisters: await mapPromises(canisters.canisters, anonymizeCanister),
    proposals: {
      proposals: await mapPromises(proposals?.proposals, anonymizeProposal),
      certified: proposals?.certified,
    },
    proposalsFilters: proposalsFilters,
    proposalId: proposalId,
    proposalInfo: await anonymizeProposal(proposalInfo),
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
    toasts,
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
};

/**
 * 1. generates anonymized version of stores state
 * 2. log it in the dev console
 * 3. generates a json file with logged context
 */
export const generateDebugLog = async (logType: LogType) => {
  const debugStore = initDebugStore();
  const anonymise = [LogType.Console, LogType.File].includes(logType);
  const saveToFile = [LogType.File, LogType.FileOriginal].includes(logType);
  const state = anonymise ? await anonymiseStoreState() : get(debugStore);
  const date = new Date().toJSON().split(".")[0].replace(/:/g, "-");

  if (logType === LogType.ConsoleOriginalObject) {
    console.log(date, state);
    return;
  }

  const stringifiedState = stringifyJson(state, {
    indentation: 2,
  });

  if (saveToFile) {
    saveToJSONFile({
      blob: new Blob([stringifiedState]),
      filename: `${date}_nns-local-state.json`,
    });
  } else {
    console.log(date, stringifiedState);
  }
};
