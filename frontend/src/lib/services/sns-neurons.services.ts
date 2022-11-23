import {
  addNeuronPermissions,
  disburse as disburseApi,
  getNervousSystemFunctions,
  increaseDissolveDelay as increaseDissolveDelayApi,
  refreshNeuron,
  removeNeuronPermissions,
  setFollowees,
  startDissolving as startDissolvingApi,
  stopDissolving as stopDissolvingApi,
} from "$lib/api/sns-governance.api";
import {
  querySnsNeuron,
  querySnsNeurons,
  stakeNeuron as stakeNeuronApi,
} from "$lib/api/sns.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import {
  snsNeuronsStore,
  type ProjectNeuronStore,
} from "$lib/stores/sns-neurons.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { toToastError } from "$lib/utils/error.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import {
  followeesByFunction,
  getSnsDissolveDelaySeconds,
  getSnsNeuronByHexId,
  getSnsNeuronIdAsHexString,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
  decodeSnsAccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import {
  arrayOfNumberToUint8Array,
  fromDefinedNullable,
  fromNullable,
} from "@dfinity/utils";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "./auth.services";
import {
  checkSnsNeuronBalances,
  neuronNeedsRefresh,
} from "./sns-neurons-check-balances.services";
import { queryAndUpdate } from "./utils.services";

/**
 * Loads sns neurons in store and checks neurons's stake against the balance of the subaccount.
 *
 * On update, it will check whether there are neurons that need to be refreshed or claimed.
 * A neuron needs to be refreshed if the balance of the subaccount doesn't match the stake of the neuron.
 * A neuron needs to be claimed if there is a subaccount with balance and no neuron.
 *
 * @param {Principal} rootCanisterId
 * @returns {void}
 */
export const syncSnsNeurons = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<SnsNeuron[], unknown>({
    request: ({ certified, identity }) =>
      querySnsNeurons({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: async ({ response: neurons, certified }) => {
      snsNeuronsStore.setNeurons({
        rootCanisterId,
        neurons,
        certified,
      });

      if (certified) {
        checkSnsNeuronBalances({
          rootCanisterId,
          neurons,
        });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsNeuronsStore.resetProject(rootCanisterId);

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.sns_neurons_load",
        })
      );
    },
    logMessage: "Syncing Sns Neurons",
  });
};

const loadNeurons = async ({
  rootCanisterId,
  certified,
}: {
  rootCanisterId: Principal;
  certified: boolean;
}): Promise<void> => {
  const identity = await getAuthenticatedIdentity();
  const neurons = await querySnsNeurons({
    identity,
    rootCanisterId,
    certified,
  });
  snsNeuronsStore.setNeurons({
    rootCanisterId,
    certified,
    neurons,
  });
};

const getSnsNeuronsFromStoreByProject = (
  rootCanisterId: Principal
): ProjectNeuronStore | undefined =>
  get(snsNeuronsStore)[rootCanisterId.toText()];

const getNeuronFromStoreByIdHex = ({
  neuronIdHex,
  rootCanisterId,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
}): { neuron?: SnsNeuron; certified: boolean } => {
  const projectData = getSnsNeuronsFromStoreByProject(rootCanisterId);
  const neuron = getSnsNeuronByHexId({
    neuronIdHex,
    neurons: projectData?.neurons,
  });
  return {
    neuron,
    certified: projectData?.certified ?? false,
  };
};

export const getSnsNeuron = async ({
  neuronIdHex,
  rootCanisterId,
  forceFetch = false,
  onLoad,
  onError,
}: {
  neuronIdHex: string;
  rootCanisterId: Principal;
  forceFetch?: boolean;
  onLoad: ({
    certified,
    neuron,
  }: {
    certified: boolean;
    neuron: SnsNeuron;
  }) => void;
  onError?: ({
    certified,
    error,
  }: {
    certified: boolean;
    error: unknown;
  }) => void;
}): Promise<void> => {
  if (!forceFetch) {
    const { neuron, certified } = getNeuronFromStoreByIdHex({
      neuronIdHex,
      rootCanisterId,
    });
    if (neuron !== undefined) {
      onLoad({
        neuron,
        certified,
      });
      return;
    }
  }
  const neuronId = arrayOfNumberToUint8Array(hexStringToBytes(neuronIdHex));
  return queryAndUpdate<SnsNeuron, Error>({
    request: ({ certified, identity }) =>
      querySnsNeuron({
        rootCanisterId,
        identity,
        certified,
        neuronId: { id: neuronId },
      }),
    onLoad: async ({ response: neuron, certified }) => {
      onLoad({ neuron, certified });

      if (certified) {
        // Check that the neuron's stake is in sync with the subaccount's balance
        const neuronId = fromNullable(neuron.id);
        if (neuronId !== undefined) {
          const identity = await getNeuronIdentity();
          if (await neuronNeedsRefresh({ rootCanisterId, neuron, identity })) {
            await refreshNeuron({ rootCanisterId, identity, neuronId });
            const updatedNeuron = await querySnsNeuron({
              identity,
              rootCanisterId,
              neuronId,
              certified,
            });
            onLoad({ neuron: updatedNeuron, certified });
          }
        }
      }
    },
    onError: ({ certified, error }) => {
      onError?.({ certified, error });
    },
    logMessage: `Getting Sns Neuron ${neuronIdHex}`,
  });
};

// Implement when SNS neurons can be controlled with Hardware wallets
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNeuronIdentity = (): Promise<Identity> => getAuthenticatedIdentity();

export const addHotkey = async ({
  neuronId,
  hotkey,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  hotkey: Principal;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();
    await addNeuronPermissions({
      permissions: HOTKEY_PERMISSIONS,
      identity,
      principal: hotkey,
      rootCanisterId,
      neuronId,
    });
    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_add_hotkey",
      err,
    });
    return { success: false };
  }
};

export const removeHotkey = async ({
  neuronId,
  hotkey,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  hotkey: string;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();
    const principal = Principal.fromText(hotkey);
    await removeNeuronPermissions({
      permissions: HOTKEY_PERMISSIONS,
      identity,
      principal,
      rootCanisterId,
      neuronId,
    });
    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_remove_hotkey",
      err,
    });
    return { success: false };
  }
};

export const disburse = async ({
  rootCanisterId,
  neuronId,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();

    await disburseApi({
      rootCanisterId,
      identity,
      neuronId,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_disburse",
      err,
    });
    return { success: false };
  }
};

export const startDissolving = async ({
  rootCanisterId,
  neuronId,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();

    await startDissolvingApi({
      rootCanisterId,
      identity,
      neuronId,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_start_dissolving",
      err,
    });
    return { success: false };
  }
};

export const stopDissolving = async ({
  rootCanisterId,
  neuronId,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();

    await stopDissolvingApi({
      rootCanisterId,
      identity,
      neuronId,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_stop_dissolving",
      err,
    });
    return { success: false };
  }
};

export const updateDelay = async ({
  rootCanisterId,
  neuron,
  dissolveDelaySeconds,
}: {
  rootCanisterId: Principal;
  neuron: SnsNeuron;
  dissolveDelaySeconds: number;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();
    const currentDissolveDelay =
      getSnsDissolveDelaySeconds(neuron) ?? BigInt(0);
    const additionalDissolveDelaySeconds =
      dissolveDelaySeconds - Number(currentDissolveDelay);

    await increaseDissolveDelayApi({
      rootCanisterId,
      identity,
      neuronId: fromDefinedNullable(neuron.id),
      additionalDissolveDelaySeconds,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_dissolve_delay_action",
      err,
    });

    return { success: false };
  }
};

export const stakeNeuron = async ({
  rootCanisterId,
  amount,
  account,
}: {
  rootCanisterId: Principal;
  amount: bigint;
  account: Account;
}): Promise<{ success: boolean }> => {
  try {
    // TODO: Get identity depending on account to support HW accounts
    const identity = await getAuthenticatedIdentity();
    await stakeNeuronApi({
      controller: identity.getPrincipal(),
      rootCanisterId,
      stakeE8s: amount,
      identity,
      source: decodeSnsAccount(account.identifier),
    });
    await loadNeurons({ rootCanisterId, certified: true });
    return { success: true };
  } catch (err) {
    toastsError(
      ledgerErrorToToastError({
        err,
        fallbackErrorLabelKey: "error__sns.sns_stake",
      })
    );
    return { success: false };
  }
};

// This is a public service.
export const loadSnsNervousSystemFunctions = async (
  rootCanisterId: Principal
) => {
  const identity = await getAuthenticatedIdentity();
  // We load with a query call only. Nervous System Functions are public and not related to the user.
  const functions = await getNervousSystemFunctions({
    rootCanisterId,
    identity,
    certified: true,
  });

  snsFunctionsStore.setFunctions({
    rootCanisterId,
    functions,
  });
};

export const addFollowee = async ({
  neuron,
  functionId,
  followee,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  functionId: bigint;
  followee: SnsNeuronId;
  rootCanisterId: Principal;
}): Promise<void> => {
  // Do not allow a neuron to follow itself
  if (
    subaccountToHexString(followee.id) === getSnsNeuronIdAsHexString(neuron)
  ) {
    toastsError({
      labelKey: "new_followee.same_neuron",
    });
    return;
  }

  const identity = await getNeuronIdentity();

  const topicFollowees = followeesByFunction({ neuron, functionId });
  // Do not allow to add a neuron id who is already followed
  if (topicFollowees !== undefined && topicFollowees.includes(followee)) {
    toastsError({
      labelKey: "new_followee.already_followed",
    });
    return;
  }
  try {
    const newFollowees: SnsNeuronId[] =
      topicFollowees === undefined ? [followee] : [...topicFollowees, followee];

    await setFollowees({
      rootCanisterId,
      identity,
      // We can cast it because we already checked that the neuron id is not undefined
      neuronId: fromNullable(neuron.id) as SnsNeuronId,
      functionId,
      followees: newFollowees,
    });
  } catch (error) {
    toastsError({
      labelKey: "error__sns.sns_add_followee",
      err: error,
    });
  }
};
