import { makeSnsDummyProposals } from "$lib/api/dev.api";
import {
  addNeuronPermissions,
  autoStakeMaturity as autoStakeMaturityApi,
  disburse as disburseApi,
  disburseMaturity as disburseMaturityApi,
  getSnsNeuron as getSnsNeuronApi,
  increaseDissolveDelay,
  querySnsNeuron,
  querySnsNeurons,
  removeNeuronPermissions,
  setFollowees,
  setFollowing as setFollowingApi,
  splitNeuron as splitNeuronApi,
  stakeMaturity as stakeMaturityApi,
  startDissolving as startDissolvingApi,
  stopDissolving as stopDissolvingApi,
} from "$lib/api/sns-governance.api";
import {
  increaseStakeNeuron as increaseStakeNeuronApi,
  stakeNeuron as stakeNeuronApi,
} from "$lib/api/sns.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { snsTokensByRootCanisterIdStore } from "$lib/derived/sns/sns-tokens.derived";
import { loadActionableProposalsForSns } from "$lib/services/actionable-sns-proposals.services";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import {
  snsNeuronsStore,
  type ProjectNeuronStore,
} from "$lib/stores/sns-neurons.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import type { SnsTopicFollowing } from "$lib/types/sns";
import { isLastCall } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { ledgerErrorToToastError } from "$lib/utils/sns-ledger.utils";
import {
  followeesByFunction,
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronByHexId,
  hasAutoStakeMaturityOn,
  isEnoughAmountToSplit,
  nextMemo,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { snsTopicKeyToTopic } from "$lib/utils/sns-topics.utils";
import { formatTokenE8s, numberToE8s } from "$lib/utils/token.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import type { E8s } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron, SnsNeuronId, SnsTopic } from "@dfinity/sns";
import {
  arrayOfNumberToUint8Array,
  assertNonNullish,
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Loads sns neurons in store.
 * (Loads sns parameters when not already in the store)
 *
 * @param {Principal} rootCanisterId
 * @returns {void}
 */
export const syncSnsNeurons = async (
  rootCanisterId: Principal
): Promise<void> => {
  return queryAndUpdate<SnsNeuron[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
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
    },
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (!isLastCall({ strategy, certified })) {
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

export const loadSnsNeurons = async ({
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
    },
    onError: ({ certified, error }) => {
      onError?.({ certified, error });
    },
    logMessage: `Getting Sns Neuron ${neuronIdHex}`,
  });
};

// Implement when SNS neurons can be controlled with Ledger devices
export const getSnsNeuronIdentity = (): Promise<Identity> =>
  getAuthenticatedIdentity();

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
    const identity = await getSnsNeuronIdentity();
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
    const identity = await getSnsNeuronIdentity();
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
  neuronMinimumStake,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  amount: number;
  neuronMinimumStake: E8s;
}): Promise<{ success: boolean }> => {
  try {
    const token = get(snsTokenSymbolSelectedStore);
    assertNonNullish(token, "token not defined");

    const transactionFee = get(snsTokensByRootCanisterIdStore)[
      rootCanisterId.toText()
    ]?.fee;
    assertNonNullish(transactionFee, "fee not defined");

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
          $minimum: formatTokenE8s({ value: neuronMinimumStake }),
          $token: token.symbol,
        },
      });
      return { success: false };
    }

    // TODO: Get identity depending on account to support HW accounts
    const identity = await getSnsNeuronIdentity();
    // reload neurons (should be actual for nextMemo calculation)
    await loadSnsNeurons({
      rootCanisterId,
      certified: true,
    });
    const neurons = get(snsNeuronsStore)[rootCanisterId.toText()]
      .neurons as SnsNeuron[];
    // User can try to split and stake at the same time for a single principal id.
    // The call would fail but client could just try again after displaying the error to the user.
    // `memo` parameter may become optional in the future.
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
    const identity = await getSnsNeuronIdentity();

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
    const identity = await getSnsNeuronIdentity();

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
    const identity = await getSnsNeuronIdentity();

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
    const identity = await getSnsNeuronIdentity();

    const existingDissolveDelay = Number(
      getSnsLockedTimeInSeconds(neuron) ??
        getSnsDissolvingTimeInSeconds(neuron) ??
        0n
    );

    await increaseDissolveDelay({
      rootCanisterId,
      identity,
      neuronId: fromDefinedNullable(neuron.id),
      additionalDissolveDelaySeconds:
        dissolveDelaySeconds - existingDissolveDelay,
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
      source: decodeIcrcAccount(account.identifier),
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

    // The stakeNeuron function should not be called with an amount smaller than
    // the minimum stake. This check is only here to prevent people losing
    // tokens if the check is accidentally not done before, but does not provide
    // a proper error message.
    const paramsStore = get(snsParametersStore);
    const minimumStakeE8s = fromDefinedNullable(
      paramsStore[rootCanisterId.toText()]?.parameters
        ?.neuron_minimum_stake_e8s ?? []
    );
    if (stakeE8s < minimumStakeE8s) {
      throw new Error(
        "The caller should make sure the amount is at least the minimum stake"
      );
    }

    const fee = get(snsTokensByRootCanisterIdStore)[rootCanisterId.toText()]
      ?.fee;

    if (isNullish(fee)) {
      throw new Error("error.transaction_fee_not_found");
    }

    await stakeNeuronApi({
      controller: identity.getPrincipal(),
      rootCanisterId,
      stakeE8s,
      identity,
      source: decodeIcrcAccount(account.identifier),
      fee,
    });
    await Promise.all([
      loadSnsAccounts({ rootCanisterId }),
      loadSnsNeurons({ rootCanisterId, certified: true }),
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
  const identity = await getSnsNeuronIdentity();
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
 * Makes a call to set the followees for a neuron for a specific topics.
 */
export const setFollowing = async ({
  rootCanisterId,
  neuronId,
  followings,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  followings: SnsTopicFollowing[];
}): Promise<{ success: boolean; error?: unknown }> => {
  const identity = await getSnsNeuronIdentity();

  try {
    const topicFollowing = followings.map(({ topic, followees }) => ({
      topic: snsTopicKeyToTopic(topic) as SnsTopic,
      followees,
    }));
    await setFollowingApi({
      identity,
      neuronId,
      rootCanisterId,
      topicFollowing,
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error };
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
  const identity = await getSnsNeuronIdentity();
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

export const removeNsFunctionFollowees = async ({
  neuron,
  functionId,
  rootCanisterId,
}: {
  neuron: SnsNeuron;
  functionId: bigint;
  rootCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  const identity = await getSnsNeuronIdentity();

  try {
    await setFollowees({
      rootCanisterId,
      identity,
      neuronId: fromDefinedNullable(neuron.id),
      functionId,
      followees: [],
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
    const identity = await getSnsNeuronIdentity();

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

export const disburseMaturity = async ({
  neuronId,
  rootCanisterId,
  percentageToDisburse,
  toAccountAddress,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  percentageToDisburse: number;
  toAccountAddress?: string;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getSnsNeuronIdentity();

    const toAccount = nonNullish(toAccountAddress)
      ? decodeIcrcAccount(toAccountAddress)
      : undefined;

    await disburseMaturityApi({
      neuronId,
      rootCanisterId,
      percentageToDisburse,
      identity,
      toAccount,
    });

    return { success: true };
  } catch (err: unknown) {
    toastsError({
      labelKey: "error__sns.sns_disburse_maturity",
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
    const identity = await getSnsNeuronIdentity();

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

export const makeDummyProposals = async ({
  neuronId,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
}): Promise<void> => {
  try {
    const identity = await getSnsNeuronIdentity();

    await makeSnsDummyProposals({
      neuronId,
      rootCanisterId,
      identity,
    });

    // reload actionable proposals
    await loadActionableProposalsForSns(rootCanisterId);

    toastsSuccess({
      labelKey: "neuron_detail.dummy_proposal_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "error.dummy_proposal",
      err,
    });
  }
};
