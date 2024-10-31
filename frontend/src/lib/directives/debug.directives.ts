import { addHotkey } from "$lib/api/governance.api";
import type { FeatureKey } from "$lib/constants/environment.constants";
import { initDebugStore } from "$lib/derived/debug.derived";
import { listNeurons, removeFollowee } from "$lib/services/neurons.services";
import {
  EDITABLE_FEATURE_FLAGS,
  overrideFeatureFlagsStore,
} from "$lib/stores/feature-flags.store";
import { i18n } from "$lib/stores/i18n";
import { neuronsStore } from "$lib/stores/neurons.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { enumKeys } from "$lib/utils/enum.utils";
import { followeesByTopic } from "$lib/utils/neuron.utils";
import { Topic, type NeuronId } from "@dfinity/nns";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "../services/auth.services";
import { claimSeedNeurons } from "../services/seed-neurons.services";

/**
 * coo - original as object -> console
 * cn - claim neurons
 * ah - Tries to add the current user's principal as hotkey to the given neuron.
 * rfds - Removes any followee of the deprecated topic SnsDecentralizationSale for all the user's neurons.
 */
export enum LogType {
  ConsoleOriginalObject = "coo",
  ClaimNeurons = "cn",
  AddHotkey = "ah",
  RemoveFolloweesDecentralizedSale = "rfds",
  FeatureFlagsOverrideTrue = "fft",
  FeatureFlagsOverrideFalse = "fff",
  FeatureFlagsOverrideRemove = "ffr",
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

        if (LogType.RemoveFolloweesDecentralizedSale === logType) {
          removeFolloweesDecentralizedSale();
          return;
        }

        if (LogType.FeatureFlagsOverrideTrue === logType) {
          const flag = promptFeatureFlag(
            get(i18n).feature_flags_prompt.override_true
          );
          flag && overrideFeatureFlagsStore.setFlag(flag, true);
          return;
        }

        if (LogType.FeatureFlagsOverrideFalse === logType) {
          const flag = promptFeatureFlag(
            get(i18n).feature_flags_prompt.override_false
          );
          flag && overrideFeatureFlagsStore.setFlag(flag, false);
          return;
        }

        if (LogType.FeatureFlagsOverrideRemove === logType) {
          const flag = promptFeatureFlag(
            get(i18n).feature_flags_prompt.remove_override
          );
          flag && overrideFeatureFlagsStore.removeFlag(flag);
          return;
        }

        if (LogType.ConsoleOriginalObject === logType) {
          const debugStore = initDebugStore();
          logWithTimestamp(get(debugStore));
          return;
        }
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
    const identity = await getAuthenticatedIdentity();
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

/**
 * Removes any followee of the deprecated topic SnsDecentralizationSale for all the user's neurons.
 */
const removeFolloweesDecentralizedSale = async () => {
  try {
    const { neurons } = get(neuronsStore);
    if (neurons !== undefined) {
      await Promise.all(
        neurons.map((neuron) => {
          return Promise.all(
            (
              followeesByTopic({
                neuron,
                topic: Topic.SnsDecentralizationSale,
              }) ?? []
            ).map((neuronId) =>
              removeFollowee({
                neuronId: neuron.neuronId,
                topic: Topic.SnsDecentralizationSale,
                followee: neuronId,
              })
            )
          );
        })
      );
      await listNeurons();
    }

    toastsSuccess({
      labelKey: "neurons.remove_followees_sale_prompt_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "neurons.remove_followees_sale_prompt_error",
      err,
    });
  }
};

const promptFeatureFlag = (question: string): FeatureKey | null => {
  const editableNonTestFlags = EDITABLE_FEATURE_FLAGS.filter(
    (flag) => !flag.startsWith("TEST_")
  );
  const message = [
    question,
    ...editableNonTestFlags.map((flag, index) => `${index + 1}: ${flag}`),
  ].join("\n");

  const choice = Number(prompt(message));

  if (choice >= 1 && choice <= editableNonTestFlags.length) {
    return editableNonTestFlags[choice - 1];
  }
  return null;
};
