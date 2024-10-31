import { governanceApiService } from "$lib/api-services/governance.api-service";
import { makeDummyProposals as makeDummyProposalsApi } from "$lib/api/dev.api";
import { queryAccountBalance } from "$lib/api/icp-ledger.api";
import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { IS_TESTNET } from "$lib/constants/environment.constants";
import {
  CANDID_PARSER_VERSION,
  SNS_SUPPORT_VERSION,
} from "$lib/constants/ledger-app.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
import type { LedgerIdentity } from "$lib/identities/ledger.identity";
import { getLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import {
  toastsError,
  toastsShow,
  toastsSuccess,
} from "$lib/stores/toasts.store";
import type { Account } from "$lib/types/account";
import { NotEnoughAmountError } from "$lib/types/common.errors";
import {
  CannotBeMerged,
  NotAuthorizedNeuronError,
  NotFoundError,
} from "$lib/types/neurons.errors";
import {
  assertEnoughAccountFunds,
  isAccountHardwareWallet,
} from "$lib/utils/accounts.utils";
import { isLastCall } from "$lib/utils/env.utils";
import {
  errorToString,
  mapNeuronErrorToToastMessage,
} from "$lib/utils/error.utils";
import { translate } from "$lib/utils/i18n.utils";
import {
  canBeMerged,
  followeesByTopic,
  hasAutoStakeMaturityOn,
  hasJoinedCommunityFund,
  isEnoughToStakeNeuron,
  isHotKeyControllable,
  isIdentityController,
  isNeuronControlledByHardwareWallet,
  userAuthorizedNeuron,
  validTopUpAmount,
} from "$lib/utils/neuron.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import {
  NeuronVisibility,
  Topic,
  type Neuron,
  type NeuronId,
  type NeuronInfo,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "./auth.services";
import {
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  loadBalance,
  transferICP,
} from "./icp-accounts.services";
import { assertLedgerVersion } from "./icp-ledger.services";
import { queryAndUpdate, type QueryAndUpdateStrategy } from "./utils.services";

const getIdentityAndNeuronHelper = async (
  neuronId: NeuronId
): Promise<{ identity: Identity; neuron: NeuronInfo }> => {
  const currentIdentity = await getAuthenticatedIdentity();
  const neuron = await getNeuron({ neuronId, identity: currentIdentity });

  if (neuron === undefined) {
    throw new NotFoundError();
  }

  return {
    neuron,
    identity: currentIdentity,
  };
};
/**
 * Return single neuron from neuronsStore or fetch it (in case of page reload or direct navigation to neuron-detail page)
 *
 * forceFetch: boolean. Forces to make a call to the canister to get the neuron again.
 */
const getNeuron = async ({
  neuronId,
  identity,
  certified = false,
  forceFetch = false,
}: {
  neuronId: NeuronId;
  identity: Identity;
  certified?: boolean;
  forceFetch?: boolean;
}): Promise<NeuronInfo | undefined> => {
  if (forceFetch) {
    return governanceApiService.queryNeuron({ neuronId, identity, certified });
  }
  const neuron = getNeuronFromStore(neuronId);

  return (
    neuron ||
    governanceApiService.queryNeuron({ neuronId, identity, certified })
  );
};

export const getNeuronFromStore = (
  neuronId: NeuronId
): NeuronInfo | undefined =>
  get(definedNeuronsStore).find((neuron) => neuron.neuronId === neuronId);

// Exported to be tested
export const getIdentityOfControllerByNeuronId = async (
  neuronId: NeuronId
): Promise<Identity> => {
  const { neuron, identity } = await getIdentityAndNeuronHelper(neuronId);

  if (
    neuron.fullNeuron === undefined ||
    neuron.fullNeuron.controller === undefined
  ) {
    throw new NotAuthorizedNeuronError("Neuron has no controller");
  }

  // Check whether identity from authStore is controller
  if (neuron.fullNeuron.controller === identity.getPrincipal().toText()) {
    return identity;
  }

  // If identity form authStore is not the controller, check also accounts.
  const neuronIdentity = await getAccountIdentityByPrincipal(
    neuron.fullNeuron.controller
  );
  if (neuronIdentity === undefined) {
    throw new NotAuthorizedNeuronError();
  }
  // `getAccountIdentityByPrincipal` returns the current user identity (because of `getIdentity`) if the account is not a hardware wallet.
  // If we enable visiting neurons which are not ours, we will need this service to throw `NotAuthorizedNeuronError`.
  if (isIdentityController({ neuron, identity: neuronIdentity })) {
    return neuronIdentity;
  }

  throw new NotAuthorizedNeuronError();
};

const getStakeNeuronPropsByAccount = ({
  account,
  accountIdentity,
}: {
  account: Account;
  accountIdentity: Identity;
}): {
  ledgerCanisterIdentity: LedgerIdentity | Identity;
  identity: LedgerIdentity | Identity;
  controller: Principal;
  fromSubAccount?: SubAccountArray;
} => {
  if (isAccountHardwareWallet(account)) {
    // The software of the hardware wallet cannot sign the call to the governance canister to claim the neuron.
    // Therefore we use an `AnonymousIdentity`.
    return {
      ledgerCanisterIdentity: accountIdentity,
      identity: new AnonymousIdentity(),
      controller: accountIdentity.getPrincipal(),
    };
  }
  return {
    ledgerCanisterIdentity: accountIdentity,
    identity: accountIdentity,
    controller: accountIdentity.getPrincipal(),
    fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
  };
};

/**
 * Uses governance api to create a neuron and adds it to the store
 *
 * @param {Object} params
 * @param {amount} params.amount the new neuron value. a number that will be converted to ICP.
 * @param {account} params.account the source account for the neuron - i.e. the account that will be linked with the neuron and that provides the ICP.
 * @param {loadNeuron} [params.loadNeuron=true] load the neuron and update the neurons store once created.
 */
export const stakeNeuron = async ({
  amount,
  account,
  loadNeuron = true,
  asPublicNeuron,
}: {
  amount: number;
  account: Account;
  loadNeuron?: boolean;
  asPublicNeuron?: boolean;
}): Promise<NeuronId | undefined> => {
  try {
    const stake = numberToE8s(amount);
    assertEnoughAccountFunds({
      account,
      amountUlps: stake,
    });

    if (!isEnoughToStakeNeuron({ stakeE8s: stake })) {
      toastsError({
        labelKey: "error.amount_not_enough_stake_neuron",
      });
      return;
    }

    const accountIdentity = await getAccountIdentity(account.identifier);
    const isHardwareWallet = isAccountHardwareWallet(account);
    if (isHardwareWallet && "flagUpcomingStakeNeuron" in accountIdentity) {
      // TODO: Find a better solution than setting a flag.
      accountIdentity.flagUpcomingStakeNeuron();
    }
    const { ledgerCanisterIdentity, controller, fromSubAccount, identity } =
      getStakeNeuronPropsByAccount({ account, accountIdentity });
    const fee = get(mainTransactionFeeE8sStore);

    const newNeuronId = await governanceApiService.stakeNeuron({
      stake,
      identity,
      ledgerCanisterIdentity,
      controller,
      fromSubAccount,
      fee,
    });

    if (asPublicNeuron) {
      try {
        await governanceApiService.changeNeuronVisibility({
          neuronIds: [newNeuronId],
          visibility: NeuronVisibility.Public,
          identity: accountIdentity,
        });
      } catch (err) {
        toastsError({
          labelKey: "neurons.create_as_public_neuron_failure",
        });
      }
    }

    if (loadNeuron) {
      await getAndLoadNeuron(newNeuronId);
    }

    return newNeuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
    return;
  }
};

/**
 * This gets all neurons linked to the current user's principal, even those with a stake of 0. And adds them to the store
 *
 * @param {Object} params
 * @param {callback} params.callback an optional callback that can be called when the data are successfully loaded (certified or not). Useful for example to close synchronously a busy spinner once all data have been fetched.
 */
export const listNeurons = async ({
  callback,
  strategy,
}: {
  callback?: (certified: boolean) => void;
  strategy?: QueryAndUpdateStrategy;
} = {}): Promise<void> => {
  return queryAndUpdate<NeuronInfo[], unknown>({
    strategy: strategy ?? FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      governanceApiService.queryNeurons({
        certified,
        identity,
        includeEmptyNeurons: false,
      }),
    onLoad: async ({ response: neurons, certified }) => {
      neuronsStore.setNeurons({ neurons, certified });

      callback?.(certified);
    },
    onError: ({ error, certified, strategy }) => {
      if (!isLastCall({ strategy, certified })) {
        return;
      }

      // Explicitly handle only UPDATE errors
      neuronsStore.setNeurons({ neurons: [], certified });

      toastsError({
        labelKey: "error.get_neurons",
        err: error,
      });
    },
  });
};

// We always want to call this with the user identity
export const getAndLoadNeuron = async (neuronId: NeuronId) => {
  const identity = await getAuthenticatedIdentity();
  const neuron: NeuronInfo | undefined = await getNeuron({
    neuronId,
    identity,
    certified: true,
    forceFetch: true,
  });
  if (!neuron) {
    throw new NotFoundError();
  }
  if (!userAuthorizedNeuron(neuron)) {
    throw new NotAuthorizedNeuronError(
      `User not authorized to access neuron ${neuronId}`
    );
  }
  neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
};

export const updateDelay = async ({
  neuronId,
  dissolveDelayInSeconds,
}: {
  neuronId: NeuronId;
  dissolveDelayInSeconds: number;
}): Promise<NeuronId | undefined> => {
  try {
    const neuronIdentity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);
    await governanceApiService.increaseDissolveDelay({
      neuronId,
      dissolveDelayInSeconds,
      identity: neuronIdentity,
    });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
    // To inform there was an error
    return undefined;
  }
};

export const toggleCommunityFund = async (
  neuron: NeuronInfo
): Promise<NeuronId | undefined> => {
  try {
    const { identity } = await getIdentityAndNeuronHelper(neuron.neuronId);

    if (hasJoinedCommunityFund(neuron)) {
      await governanceApiService.leaveCommunityFund({
        neuronId: neuron.neuronId,
        identity,
      });
    } else {
      await governanceApiService.joinCommunityFund({
        neuronId: neuron.neuronId,
        identity,
      });
    }

    await getAndLoadNeuron(neuron.neuronId);

    return neuron.neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
  }
};

export const toggleAutoStakeMaturity = async (
  neuron: NeuronInfo
): Promise<{ success: boolean; err?: string }> => {
  try {
    const { neuronId } = neuron;

    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await assertLedgerVersion({
      identity,
      minVersion: CANDID_PARSER_VERSION,
    });

    await governanceApiService.autoStakeMaturity({
      neuronId,
      identity,
      autoStake: !hasAutoStakeMaturityOn(neuron),
    });

    await getAndLoadNeuron(neuron.neuronId);

    return { success: true };
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
    return { success: false, err: errorToString(err) };
  }
};

const checkCanBeMerged = async ({
  sourceNeuronId,
  targetNeuronId,
}: {
  sourceNeuronId: NeuronId;
  targetNeuronId: NeuronId;
}): Promise<{ sourceNeuron: NeuronInfo; targetNeuron: NeuronInfo }> => {
  const { neuron: sourceNeuron } =
    await getIdentityAndNeuronHelper(sourceNeuronId);
  const { neuron: targetNeuron } =
    await getIdentityAndNeuronHelper(targetNeuronId);
  const { isValid, messageKey } = canBeMerged([sourceNeuron, targetNeuron]);
  if (!isValid) {
    throw new CannotBeMerged(
      translate({ labelKey: messageKey ?? "error.governance_error" })
    );
  }
  return { sourceNeuron, targetNeuron };
};

export const mergeNeurons = async ({
  sourceNeuronId,
  targetNeuronId,
}: {
  sourceNeuronId: NeuronId;
  targetNeuronId: NeuronId;
}): Promise<NeuronId | undefined> => {
  let success = false;
  try {
    const { targetNeuron } = await checkCanBeMerged({
      sourceNeuronId,
      targetNeuronId,
    });

    const identity: Identity =
      await getIdentityOfControllerByNeuronId(targetNeuronId);
    const accounts = get(icpAccountsStore);
    if (
      isNeuronControlledByHardwareWallet({ neuron: targetNeuron, accounts })
    ) {
      await assertLedgerVersion({
        identity,
        minVersion: CANDID_PARSER_VERSION,
      });
    }

    await governanceApiService.mergeNeurons({
      sourceNeuronId,
      targetNeuronId,
      identity,
    });
    success = true;

    await listNeurons();

    return targetNeuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return success ? targetNeuronId : undefined;
  }
};

export const simulateMergeNeurons = async ({
  sourceNeuronId,
  targetNeuronId,
}: {
  sourceNeuronId: NeuronId;
  targetNeuronId: NeuronId;
}): Promise<NeuronInfo | undefined> => {
  try {
    await checkCanBeMerged({
      sourceNeuronId,
      targetNeuronId,
    });

    const identity: Identity = await getAuthenticatedIdentity();

    return await governanceApiService.simulateMergeNeurons({
      sourceNeuronId,
      targetNeuronId,
      identity,
    });
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
    // To inform there was an error
    return undefined;
  }
};

// This service is used to add a "hotkey" - i.e. delegate the control of a neuron to NNS-dapp - to a neuron created with the hardware wallet.
// It uses the auth identity - i.e. the identity of the current user - as principal of the new hotkey.
// Once the neuron delegated, it adds it to the neuron store so that user can find this neuron in the "Neurons" tab as well
// Note: it does not reload the all neurons store but "only" query (updated call) and push the newly attached neuron to the store
export const addHotkeyForHardwareWalletNeuron = async ({
  neuronId,
  accountIdentifier,
}: {
  neuronId: NeuronId;
  accountIdentifier: string;
}): Promise<{ success: boolean; err?: string }> => {
  try {
    startBusy({
      initiator: "add-hotkey-neuron",
      labelKey: "busy_screen.pending_approval_hw",
    });

    const identity: Identity = await getAuthenticatedIdentity();
    const ledgerIdentity = await getLedgerIdentityProxy(accountIdentifier);

    await governanceApiService.addHotkey({
      neuronId,
      identity: ledgerIdentity,
      principal: identity.getPrincipal(),
    });

    await getAndLoadNeuron(neuronId);

    stopBusy("add-hotkey-neuron");

    toastsSuccess({
      labelKey: "neurons.add_user_as_hotkey_success",
    });

    return { success: true };
  } catch (err) {
    // TODO: Manage edge cases https://dfinity.atlassian.net/browse/L2-526

    stopBusy("add-hotkey-neuron");

    const toastMsg = mapNeuronErrorToToastMessage(err);

    toastsShow(toastMsg);

    // To inform there was an error
    return { success: false, err: toastMsg.labelKey };
  }
};

export const addHotkey = async ({
  neuronId,
  principal,
}: {
  neuronId: NeuronId;
  principal: Principal;
}): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await governanceApiService.addHotkey({ neuronId, identity, principal });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
  }
};

export const removeHotkey = async ({
  neuronId,
  principalString,
}: {
  neuronId: NeuronId;
  principalString: string;
}): Promise<NeuronId | undefined> => {
  let principal: Principal | undefined = undefined;
  try {
    principal = Principal.fromText(principalString);
  } catch {
    toastsError({
      labelKey: "neuron_detail.invalid_hotkey",
    });
    return;
  }
  let removed = false;
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await governanceApiService.removeHotkey({ neuronId, identity, principal });
    removed = true;

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    if (removed && err instanceof NotAuthorizedNeuronError) {
      // There is no need to get the identity unless removing the hotkey succeeded
      // and it was `getAndLoadNeuron` that threw the error.
      const currentIdentityPrincipal = (await getAuthenticatedIdentity())
        .getPrincipal()
        .toText();
      // This happens when a user removes itself from the hotkeys.
      return principalString === currentIdentityPrincipal
        ? neuronId
        : undefined;
    }

    toastsShow(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
  }
};

export const splitNeuron = async ({
  neuron,
  amount,
}: {
  neuron: NeuronInfo;
  amount: number;
}): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuron.neuronId
    );
    const accounts = get(icpAccountsStore);
    if (isNeuronControlledByHardwareWallet({ neuron, accounts })) {
      await assertLedgerVersion({
        identity,
        minVersion: SNS_SUPPORT_VERSION,
      });
    }

    const feeE8s = get(mainTransactionFeeE8sStore);
    const amountE8s = numberToE8s(amount) + feeE8s;

    if (!isEnoughToStakeNeuron({ stakeE8s: amountE8s, feeE8s })) {
      throw new NotEnoughAmountError();
    }

    await governanceApiService.splitNeuron({
      neuronId: neuron.neuronId,
      identity,
      amount: amountE8s,
    });

    await listNeurons();

    return neuron.neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
    return undefined;
  }
};

export const disburse = async ({
  neuronId,
  toAccountId,
}: {
  neuronId: NeuronId;
  toAccountId: string;
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await governanceApiService.disburse({ neuronId, toAccountId, identity });

    await Promise.all([
      loadBalance({ accountIdentifier: toAccountId }),
      listNeurons(),
    ]);

    return { success: true };
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    return { success: false };
  }
};

export const stakeMaturity = async ({
  neuronId,
  percentageToStake,
}: {
  neuronId: NeuronId;
  percentageToStake: number;
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await assertLedgerVersion({
      identity,
      minVersion: CANDID_PARSER_VERSION,
    });

    await governanceApiService.stakeMaturity({
      neuronId,
      percentageToStake,
      identity,
    });

    await getAndLoadNeuron(neuronId);

    return { success: true };
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    return { success: false };
  }
};

export const spawnNeuron = async ({
  neuronId,
  percentageToSpawn,
}: {
  neuronId: NeuronId;
  percentageToSpawn?: number;
}): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    const newNeuronId = await governanceApiService.spawnNeuron({
      neuronId,
      percentageToSpawn,
      identity,
    });

    await listNeurons();

    return newNeuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    return undefined;
  }
};

export const startDissolving = async (
  neuronId: NeuronId
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await governanceApiService.startDissolving({ neuronId, identity });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    return undefined;
  }
};

export const stopDissolving = async (
  neuronId: NeuronId
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);

    await governanceApiService.stopDissolving({ neuronId, identity });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));

    return undefined;
  }
};

const setFolloweesHelper = async ({
  neuron,
  topic,
  followees,
}: {
  neuron: NeuronInfo | undefined;
  topic: Topic;
  followees: NeuronId[];
}) => {
  try {
    if (neuron === undefined) {
      throw new NotFoundError(
        "Neuron not found in store. We can't check authorization to set followees."
      );
    }
    // We try to control by hotkey by default
    let identity: Identity = await getAuthenticatedIdentity();
    if (!isHotKeyControllable({ neuron, identity })) {
      identity = await getIdentityOfControllerByNeuronId(neuron.neuronId);
    }
    // ManageNeuron topic followes can only be handled by controllers
    if (topic === Topic.NeuronManagement) {
      identity = await getIdentityOfControllerByNeuronId(neuron.neuronId);
    }
    await governanceApiService.setFollowees({
      identity,
      neuronId: neuron.neuronId,
      topic,
      followees,
    });
    await getAndLoadNeuron(neuron.neuronId);
  } catch (err) {
    toastsShow(mapNeuronErrorToToastMessage(err));
  }
};

export const addFollowee = async ({
  neuronId,
  topic,
  followee,
}: {
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  const neuron = getNeuronFromStore(neuronId);

  const topicFollowees = followeesByTopic({ neuron, topic });
  // Do not allow to add a neuron id who is already followed
  if (topicFollowees !== undefined && topicFollowees.includes(followee)) {
    toastsError({
      labelKey: "new_followee.already_followed",
    });
    return;
  }

  const newFollowees: NeuronId[] =
    topicFollowees === undefined ? [followee] : [...topicFollowees, followee];

  await setFolloweesHelper({
    neuron,
    topic,
    followees: newFollowees,
  });
};

export const removeFollowee = async ({
  neuronId,
  topic,
  followee,
}: {
  neuronId: NeuronId;
  topic: Topic;
  followee: NeuronId;
}): Promise<void> => {
  const neuron = getNeuronFromStore(neuronId);

  const topicFollowees: NeuronId[] | undefined = followeesByTopic({
    neuron,
    topic,
  });
  if (topicFollowees === undefined) {
    // Followee in that topic does not exist.
    toastsError({
      labelKey: "error.followee_does_not_exist",
    });
    return;
  }
  const newFollowees: NeuronId[] = topicFollowees.filter(
    (id) => id !== followee
  );
  await setFolloweesHelper({
    neuron,
    topic,
    followees: newFollowees,
  });
};

/**
 * Get from store or query a neuron and apply the result to the callback (`setNeuron`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
export const loadNeuron = ({
  neuronId,
  forceFetch = false,
  setNeuron,
  handleError,
  strategy,
}: {
  neuronId: NeuronId;
  forceFetch?: boolean;
  setNeuron: (params: { neuron: NeuronInfo; certified: boolean }) => void;
  handleError?: () => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const catchError = (err: unknown) => {
    if (err instanceof NotFoundError) {
      toastsError({
        labelKey: "error.neuron_not_found",
        err,
      });
    } else {
      toastsError({
        labelKey: "error.neuron_load",
        err,
      });
    }

    handleError?.();
  };

  return queryAndUpdate<NeuronInfo | undefined, unknown>({
    strategy,
    request: (options) =>
      getNeuron({
        neuronId,
        forceFetch,
        ...options,
      }),
    onLoad: async ({ response: neuron, certified }) => {
      if (neuron === undefined) {
        catchError(new NotFoundError(`Neuron with id ${neuronId} not found`));
        return;
      }
      setNeuron({ neuron, certified });
    },
    onError: ({ error, certified, strategy }) => {
      console.error(error);

      if (!isLastCall({ strategy, certified })) {
        return;
      }
      catchError(error);
    },
  });
};

// Not resolve until the neuron has been loaded
export const reloadNeuron = (neuronId: NeuronId) =>
  new Promise<void>((resolve) => {
    getAuthenticatedIdentity()
      // To update the neuron stake with the subaccount balance
      .then((identity) =>
        governanceApiService.claimOrRefreshNeuron({ identity, neuronId })
      )
      .then(() => {
        loadNeuron({
          neuronId,
          forceFetch: true,
          strategy: "update",
          setNeuron: ({ neuron, certified }) => {
            neuronsStore.pushNeurons({ neurons: [neuron], certified });
            resolve();
          },
          handleError: () => {
            resolve();
          },
        });
      });
  });

export const topUpNeuron = async ({
  amount,
  neuron,
  sourceAccount,
}: {
  amount: number;
  neuron: NeuronInfo;
  sourceAccount: Account;
}): Promise<{ success: boolean }> => {
  if (neuron.fullNeuron?.accountIdentifier === undefined) {
    toastsError({
      labelKey: "error.neuron_account_not_found",
    });
    return { success: false };
  }

  // TODO: Check the amount when the user enters amount in the input field.
  // https://dfinity.atlassian.net/browse/GIX-798
  if (!validTopUpAmount({ neuron, amount })) {
    toastsError({
      labelKey: "error.amount_not_enough_top_up_neuron",
    });
    return { success: false };
  }

  const { success } = await transferICP({
    sourceAccount,
    destinationAddress: neuron.fullNeuron?.accountIdentifier,
    amount,
  });

  if (success) {
    await reloadNeuron(neuron.neuronId);
  }

  return { success };
};

const neuronNeedsRefresh = async (fullNeuron: Neuron): Promise<boolean> => {
  const expectedBalance: bigint = fullNeuron.cachedNeuronStake;
  const actualBalance: bigint = await queryAccountBalance({
    icpAccountIdentifier: fullNeuron.accountIdentifier,
    identity: new AnonymousIdentity(),
    // This is just a fallback. Worst case a malicious node prevents us from
    // refreshing the neuron but then it will be refreshed next time.
    certified: false,
  });
  return expectedBalance !== actualBalance;
};

export const refreshNeuronIfNeeded = async (
  neuron: NeuronInfo
): Promise<void> => {
  if (isNullish(neuron.fullNeuron)) {
    return;
  }
  const accountIdentifier = neuron.fullNeuron.accountIdentifier;

  // We only check neurons to recover from an interrupted top-up.
  // Doing this once per neuron per session is often enough.
  if (
    !checkedNeuronSubaccountsStore.addSubaccount({
      universeId: OWN_CANISTER_ID_TEXT,
      // It's not actually the subaccount but rather the full account
      // identifier. But ic-js doesn't expose the neuron's subaccount and it
      // really just needs to be a unique consistent identifier to avoid
      // checking too often.
      subaccountHex: accountIdentifier,
    })
  ) {
    return;
  }

  if (await neuronNeedsRefresh(neuron.fullNeuron)) {
    await reloadNeuron(neuron.neuronId);
    toastsSuccess({
      labelKey: "neuron_detail.neuron_stake_refreshed",
    });
  }
};

export const makeDummyProposals = async (neuronId: NeuronId): Promise<void> => {
  // Only available in testnet
  if (!IS_TESTNET) {
    return;
  }
  try {
    const identity: Identity =
      await getIdentityOfControllerByNeuronId(neuronId);
    const { snsSummariesStore } = await import("../stores/sns.store");
    const projects = get(snsSummariesStore);
    const pendingProject = projects.find(
      // Use 1 instead of using enum to avoid importing sns-js
      (summary) => summary.getLifecycle() === 1
    );
    await makeDummyProposalsApi({
      neuronId,
      identity,
      swapCanisterId: pendingProject?.swapCanisterId.toText(),
    });

    // reload actionable proposals
    await loadActionableProposals();

    toastsSuccess({
      labelKey: "neuron_detail.dummy_proposal_success",
    });
    return;
  } catch (error) {
    console.error(error);
    toastsShow(mapNeuronErrorToToastMessage(error));
  }
};

export const changeNeuronVisibility = async ({
  neurons,
  makePublic,
}: {
  neurons: NeuronInfo[];
  makePublic: boolean;
}): Promise<{ success: boolean }> => {
  const results = await Promise.all(
    neurons.map(async (neuron) => {
      try {
        const identity: Identity = await getIdentityOfControllerByNeuronId(
          neuron.neuronId
        );
        await governanceApiService.changeNeuronVisibility({
          neuronIds: [neuron.neuronId],
          identity,
          visibility: makePublic
            ? NeuronVisibility.Public
            : NeuronVisibility.Private,
        });
        await getAndLoadNeuron(neuron.neuronId);
        return true;
      } catch (err) {
        console.error(
          `Failed to change visibility for neuron ${neuron.neuronId}:`,
          err
        );
        return false;
      }
    })
  );

  const failedCount = results.filter((result) => result === false).length;

  if (failedCount === 0) {
    return { success: true };
  } else if (failedCount < neurons.length) {
    toastsError({
      labelKey: "neuron_detail.change_neuron_visibility_partial_failure",
      substitutions: {
        $failedCount: failedCount.toString(),
        $totalCount: neurons.length.toString(),
      },
    });
  } else {
    toastsError({
      labelKey: "neuron_detail.change_neuron_visibility_failure",
    });
  }
  return { success: false };
};
