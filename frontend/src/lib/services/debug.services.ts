import { get } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import { generateDebugLogProxy } from "../proxy/debug.services.proxy";
import { initDebugStore } from "../stores/debug.store";
import { i18n } from "../stores/i18n";
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
import { enumKeys } from "../utils/enum.utils";
import { saveToJSONFile } from "../utils/save.utils";
import { mapPromises, stringifyJson } from "../utils/utils";
import { claimSeedNeurons } from "./seed-neurons.services";

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
  ClaimNeurons = "cn",
}

/**
 * Action function to bind debug logger tigger to the node (6 clicks in 2 seconds)
 */
export function triggerDebugReport(node: HTMLElement) {
  const TWO_SECONDS = 2 * 1000;
  const originalTouchActionValue: string = node.style.touchAction;

  let startTime: number = 0;
  let count = 0;

  const click = () => {
    const now = Date.now();

    if (now - startTime <= TWO_SECONDS) {
      count++;

      if (count === 5) {
        const logType: LogType = prompt(get(i18n).core.log) as LogType;

        // input validation
        if (!enumKeys(LogType).includes(logType)) {
          return;
        }

        if (LogType.ClaimNeurons === logType) {
          claimSeedNeurons();
          return;
        }

        generateDebugLogProxy(logType);
      }
    } else {
      startTime = now;
      count = 0;
    }
  };

  node.style.touchAction = "manipulation";
  node.addEventListener("click", click, { passive: true });

  return {
    destroy() {
      node.style.touchAction = originalTouchActionValue;
      node.removeEventListener("click", click, false);
    },
  };
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
    votingNeuronSelect,
    toasts,
    addAccount,
    hardwareWalletNeurons,
    transaction,
    selectedAccount,
    selectedProposal,
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
    proposalId: selectedProposal.proposal?.id,
    proposalInfo: await anonymizeProposal(selectedProposal.proposal),
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
