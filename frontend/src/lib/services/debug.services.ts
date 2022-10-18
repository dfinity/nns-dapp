import { addHotkey } from "$lib/api/governance.api";
import { generateDebugLogProxy } from "$lib/proxy/debug.services.proxy";
import { initDebugStore } from "$lib/stores/debug.store";
import { i18n } from "$lib/stores/i18n";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import {
  anonymizeAccount,
  anonymizeCanister,
  anonymizeKnownNeuron,
  anonymizeNeuronInfo,
  anonymizeProposal,
  anonymizeSnsSummary,
  anonymizeSnsSwapCommitment,
  cutAndAnonymize,
} from "$lib/utils/anonymize.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { enumKeys } from "$lib/utils/enum.utils";
import { saveToJSONFile } from "$lib/utils/save.utils";
import { mapPromises, stringifyJson } from "$lib/utils/utils";
import type { NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";
import { getIdentity } from "./auth.services";
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
  AddHotkey = "ah",
}

/**
 * Action function to bind debug logger trigger to the node (6 clicks in 2 seconds)
 */
export function triggerDebugReport(node: HTMLElement) {
  const TWO_SECONDS = 2 * 1000;
  const originalTouchActionValue = node.style.touchAction;

  let startTime = 0;
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

        if (LogType.AddHotkey === logType) {
          const neuronIdString = prompt(
            get(i18n).neurons.enter_neuron_id_prompt
          );
          addHotkeyFromPrompt(neuronIdString);
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

const addHotkeyFromPrompt = async (neuronIdString: string | null) => {
  try {
    if (neuronIdString === null) {
      throw new Error("You need to provide a neuron id.");
    }
    const neuronId = BigInt(neuronIdString) as NeuronId;
    const identity = await getIdentity();
    await addHotkey({ neuronId, principal: identity.getPrincipal(), identity });
    toastsSuccess({
      labelKey: "neurons.add_hotkey_prompt_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "neurons.add_hotkey_prompt_error",
      err,
    });
  }
};

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
    selectedAccount,
    selectedProposal,
    selectedProject,
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
    selectedAccount: {
      account: await anonymizeAccount(selectedAccount?.account),
    },
    selectedProject: {
      summary: await anonymizeSnsSummary(selectedProject.summary),
      swapCommitment: await anonymizeSnsSwapCommitment(
        selectedProject.swapCommitment
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

  if (logType === LogType.ConsoleOriginalObject) {
    logWithTimestamp(state);
    return;
  }

  const stringifiedState = stringifyJson(state, {
    indentation: 2,
  });

  if (saveToFile) {
    const date = new Date().toJSON().split(".")[0].replace(/:/g, "-");

    saveToJSONFile({
      blob: new Blob([stringifiedState]),
      filename: `${date}_nns-local-state.json`,
    });
  } else {
    logWithTimestamp(stringifiedState);
  }
};
