import {
  addNeuronPermissions,
  autoStakeMaturity as autoStakeMaturityApi,
  disburse as disburseApi,
  getNervousSystemFunctions,
  increaseDissolveDelay as increaseDissolveDelayApi,
  refreshNeuron,
  removeNeuronPermissions,
  setFollowees,
  splitNeuron as splitNeuronApi,
  stakeMaturity as stakeMaturityApi,
  startDissolving as startDissolvingApi,
  stopDissolving as stopDissolvingApi,
} from "$lib/api/sns-governance.api";
import {
  getSnsNeuron as getSnsNeuronApi,
  increaseStakeNeuron as increaseStakeNeuronApi,
  querySnsNeuron,
  querySnsNeurons,
  stakeNeuron as stakeNeuronApi,
} from "$lib/api/sns.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { i18n } from "$lib/stores/i18n";
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
  hasAutoStakeMaturityOn,
  isEnoughAmountToSplit,
  nextMemo,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { formatToken, numberToE8s } from "$lib/utils/token.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import type { E8s, Token } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  decodeSnsAccount,
  type SnsNervousSystemFunction,
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
import { loadSnsAccounts } from "./sns-accounts.services";
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

export const loadNeurons = async ({
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
      getSnsNeuronApi({
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
            const updatedNeuron = await getSnsNeuronApi({
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

export const splitNeuron = async ({
  rootCanisterId,
  neuronId,
  amount,
  transactionFee,
  token: { symbol },
  neuronMinimumStake,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  amount: number;
  transactionFee: E8s;
  token: Token;
  neuronMinimumStake: E8s;
}): Promise<{ success: boolean }> => {
  try {
    const amountE8s = numberToE8s(amount);

    const amountAndFee = amountE8s + transactionFee;

    // minimum validation
    if (
      !isEnoughAmountToSplit({
        amount: amountAndFee,
        fee: transactionFee,
        neuronMinimumStake,
      })
    ) {
      toastsError({
        labelKey: "error__sns.sns_amount_not_enough_stake_neuron",
        substitutions: {
          $minimum: formatToken({ value: neuronMinimumStake }),
          $token: `${symbol}`,
        },
      });
      return { success: false };
    }

    // TODO: Get identity depending on account to support HW accounts
    const identity = await getNeuronIdentity();
    // reload neurons (should be actual for nextMemo calculation)
    await loadNeurons({
      rootCanisterId,
      certified: true,
    });
    const neurons = get(snsNeuronsStore)[rootCanisterId.toText()]
      .neurons as SnsNeuron[];
    const memo = nextMemo({
      identity,
      neurons,
    });

    await splitNeuronApi({
      rootCanisterId,
      identity,
      neuronId,
      amount: amountAndFee,
      memo,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_split_neuron",
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

export const increaseStakeNeuron = async ({
  rootCanisterId,
  amount,
  account,
  neuronId,
}: {
  rootCanisterId: Principal;
  amount: number;
  account: Account;
  neuronId: SnsNeuronId;
}): Promise<{ success: boolean }> => {
  try {
    // TODO: Get identity depending on account to support HW accounts
    const identity = await getAuthenticatedIdentity();

    const stakeE8s = numberToE8s(amount);
    await increaseStakeNeuronApi({
      // We can cast it because we already checked that the neuron id is not undefined
      neuronId,
      rootCanisterId,
      stakeE8s,
      identity,
      source: decodeSnsAccount(account.identifier),
    });
    await loadSnsAccounts({ rootCanisterId });

    return { success: true };
  } catch (err) {
    toastsError(
      ledgerErrorToToastError({
        err,
        fallbackErrorLabelKey: "error__sns.sns_increase_stake",
      })
    );

    return { success: false };
  }
};

export const stakeNeuron = async ({
  rootCanisterId,
  amount,
  account,
}: {
  rootCanisterId: Principal;
  amount: number;
  account: Account;
}): Promise<{ success: boolean }> => {
  try {
    // TODO: Get identity depending on account to support HW accounts
    const identity = await getAuthenticatedIdentity();
    const stakeE8s = numberToE8s(amount);
    await stakeNeuronApi({
      controller: identity.getPrincipal(),
      rootCanisterId,
      stakeE8s,
      identity,
      source: decodeSnsAccount(account.identifier),
    });
    await Promise.all([
      loadSnsAccounts({ rootCanisterId }),
      loadNeurons({ rootCanisterId, certified: true }),
    ]);
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
) =>
  queryAndUpdate<SnsNervousSystemFunction[], Error>({
    request: ({ certified, identity }) =>
      getNervousSystemFunctions({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: async ({ response: nsFunctions, certified }) => {
      // TODO: Ideally, the name from the backend is user-friendly.
      // https://dfinity.atlassian.net/browse/GIX-1169
      const snsNervousSystemFunctions = nsFunctions.map((nsFunction) => {
        if (nsFunction.id === BigInt(0)) {
          const translationKeys = get(i18n);
          return {
            ...nsFunction,
            name: translationKeys.sns_neuron_detail.all_topics,
          };
        }
        return nsFunction;
      });
      snsFunctionsStore.setFunctions({
        rootCanisterId,
        nsFunctions: snsNervousSystemFunctions,
        certified,
      });
    },
    onError: ({ certified, error }) => {
      if (certified) {
        toastsError({
          labelKey: "error__sns.sns_load_functions",
          err: error,
        });
      }
    },
    logMessage: `Getting SNS ${rootCanisterId.toText()} nervous system functions`,
  });

/**
 * Makes a call to add a followee to the neuron for a specific topic
 *
 * The new set of followees needs to be calculated before the call.
 *
 * Shows toasts error if:
 * - The new followee is already in the neuron.
 * - The new followee is the same neuron.
 * - The call throws an error.
 *
 * @param {Object} params
 * @param {Principal} params.rootCanisterId
 * @param {SnsNeuron} params.neuron
 * @param {SnsNeuronId} params.followee
 * @param {bigint} params.functionId
 * @returns
 */
export const addFollowee = async ({
  neuron,
  functionId,
  followeeHex,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  functionId: bigint;
  followeeHex: string;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  // Do not allow a neuron to follow itself
  if (followeeHex === getSnsNeuronIdAsHexString(neuron)) {
    toastsError({
      labelKey: "new_followee.same_neuron",
    });
    return { success: false };
  }

  const identity = await getNeuronIdentity();
  const followee: SnsNeuronId = {
    id: arrayOfNumberToUint8Array(hexStringToBytes(followeeHex)),
  };

  const topicFollowees = followeesByFunction({ neuron, functionId });
  // Do not allow to add a neuron id who is already followed
  if (
    topicFollowees?.find(
      ({ id }) => subaccountToHexString(id) === followeeHex
    ) !== undefined
  ) {
    toastsError({
      labelKey: "new_followee.already_followed",
    });
    return { success: false };
  }
  try {
    const followeeNeuron = await querySnsNeuron({
      identity,
      rootCanisterId,
      neuronId: followee,
      certified: false,
    });
    if (followeeNeuron === undefined) {
      toastsError({
        labelKey: "new_followee.followee_does_not_exist",
        substitutions: {
          $neuronId: followeeHex,
        },
      });
      return { success: false };
    }

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

    return { success: true };
  } catch (error: unknown) {
    toastsError({
      labelKey: "error__sns.sns_add_followee",
      err: error,
    });
    return { success: false };
  }
};

/**
 * Makes a call to remove a followee to the neuron for a specific ns function.
 *
 * The new set of followees needs to be calculated before the call.
 *
 * Shows toasts error if:
 * - The followee is not in the list of followees.
 * - The call throws an error.
 *
 * @param {Object} params
 * @param {Principal} params.rootCanisterId
 * @param {SnsNeuron} params.neuron
 * @param {SnsNeuronId} params.followee
 * @param {bigint} params.functionId
 * @returns
 */
export const removeFollowee = async ({
  neuron,
  functionId,
  followee,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  functionId: bigint;
  followee: SnsNeuronId;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  const identity = await getNeuronIdentity();
  const followeeHex = subaccountToHexString(followee.id);

  const topicFollowees = followeesByFunction({ neuron, functionId });
  // Do not allow to unfollow a neuron who is not a followee
  if (
    topicFollowees?.find(
      ({ id }) => subaccountToHexString(id) === followeeHex
    ) === undefined
  ) {
    toastsError({
      labelKey: "new_followee.neuron_not_followee",
    });
    return { success: false };
  }
  try {
    const newFollowees: SnsNeuronId[] = topicFollowees?.filter(
      ({ id }) => subaccountToHexString(id) !== followeeHex
    );

    await setFollowees({
      rootCanisterId,
      identity,
      // We can cast it because we already checked that the neuron id is not undefined
      neuronId: fromNullable(neuron.id) as SnsNeuronId,
      functionId,
      followees: newFollowees,
    });

    return { success: true };
  } catch (error: unknown) {
    toastsError({
      labelKey: "error__sns.sns_remove_followee",
      err: error,
    });
    return { success: false };
  }
};

export const stakeMaturity = async ({
  neuronId,
  rootCanisterId,
  percentageToStake,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  percentageToStake: number;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getNeuronIdentity();

    await stakeMaturityApi({
      neuronId,
      rootCanisterId,
      percentageToStake,
      identity,
    });

    return { success: true };
  } catch (err: unknown) {
    toastsError({
      labelKey: "error__sns.sns_stake_maturity",
      err,
    });

    return { success: false };
  }
};

export const toggleAutoStakeMaturity = async ({
  neuron,
  neuronId,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
}): Promise<{ success: boolean; err?: string }> => {
  try {
    const identity = await getNeuronIdentity();

    await autoStakeMaturityApi({
      neuronId,
      rootCanisterId,
      identity,
      autoStake: !hasAutoStakeMaturityOn(neuron),
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_stake_maturity",
      err,
    });

    return { success: false };
  }
};
