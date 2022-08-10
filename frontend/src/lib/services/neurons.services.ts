import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { makeDummyProposals as makeDummyProposalsApi } from "../api/dev.api";
import {
  addHotkey as addHotkeyApi,
  claimOrRefreshNeuron,
  disburse as disburseApi,
  increaseDissolveDelay,
  joinCommunityFund,
  leaveCommunityFund,
  mergeMaturity as mergeMaturityApi,
  mergeNeurons as mergeNeuronsApi,
  queryNeuron,
  queryNeurons,
  removeHotkey as removeHotkeyApi,
  setFollowees,
  spawnNeuron as spawnNeuronApi,
  splitNeuron as splitNeuronApi,
  stakeNeuron as stakeNeuronApi,
  startDissolving as startDissolvingApi,
  stopDissolving as stopDissolvingApi,
} from "../api/governance.api";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { IS_TESTNET } from "../constants/environment.constants";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { MIN_VERSION_MERGE_MATURITY } from "../constants/neurons.constants";
import { AppPath } from "../constants/routes.constants";
import type { LedgerIdentity } from "../identities/ledger.identity";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import { startBusy, stopBusy } from "../stores/busy.store";
import { definedNeuronsStore, neuronsStore } from "../stores/neurons.store";
import { toastsStore } from "../stores/toasts.store";
import { mainTransactionFeeStore } from "../stores/transaction-fees.store";
import type { Account } from "../types/account";
import { InsufficientAmountError } from "../types/common.errors";
import {
  CannotBeMerged,
  NotAuthorizedNeuronError,
  NotFoundError,
} from "../types/neurons.errors";
import {
  assertEnoughAccountFunds,
  isAccountHardwareWallet,
} from "../utils/accounts.utils";
import { getLastPathDetailId, isRoutePath } from "../utils/app-path.utils";
import { mapNeuronErrorToToastMessage } from "../utils/error.utils";
import { translate } from "../utils/i18n.utils";
import { convertNumberToICP } from "../utils/icp.utils";
import {
  canBeMerged,
  followeesByTopic,
  hasJoinedCommunityFund,
  isEnoughToStakeNeuron,
  isHotKeyControllable,
  isIdentityController,
  userAuthorizedNeuron,
} from "../utils/neuron.utils";
import {
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  syncAccounts,
} from "./accounts.services";
import { getIdentity } from "./auth.services";
import { assertLedgerVersion } from "./ledger.services";
import { queryAndUpdate, type QueryAndUpdateStrategy } from "./utils.services";

const getIdentityAndNeuronHelper = async (
  neuronId: NeuronId
): Promise<{ identity: Identity; neuron: NeuronInfo }> => {
  const currentIdentity = await getIdentity();
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
    return queryNeuron({ neuronId, identity, certified });
  }
  const neuron = getNeuronFromStore(neuronId);

  return neuron || queryNeuron({ neuronId, identity, certified });
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
}: {
  amount: number;
  account: Account;
  loadNeuron?: boolean;
}): Promise<NeuronId | undefined> => {
  try {
    const stake = convertNumberToICP(amount);
    assertEnoughAccountFunds({
      account,
      amountE8s: stake.toE8s(),
    });

    if (!isEnoughToStakeNeuron({ stake })) {
      toastsStore.error({
        labelKey: "error.amount_not_enough_stake_neuron",
      });
      return;
    }

    const accountIdentity = await getAccountIdentity(account.identifier);
    if (
      isAccountHardwareWallet(account) &&
      "flagUpcomingStakeNeuron" in accountIdentity
    ) {
      // TODO: Find a better solution than setting a flag.
      accountIdentity.flagUpcomingStakeNeuron();
    }
    const { ledgerCanisterIdentity, controller, fromSubAccount, identity } =
      getStakeNeuronPropsByAccount({ account, accountIdentity });
    const newNeuronId = await stakeNeuronApi({
      stake,
      identity,
      ledgerCanisterIdentity,
      controller,
      fromSubAccount,
    });

    if (loadNeuron) {
      await getAndLoadNeuron(newNeuronId);
    }

    return newNeuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));
    return;
  }
};

/**
 * This gets all neurons linked to the current user's principal, even those with a stake of 0. And adds them to the store
 *
 * @param {Object} params
 * @param {skipCheck} params.skipCheck it true, the neurons' balance won't be checked and those that are not synced won't be refreshed. It avoids possible infinite loops.
 * @param {callback} params.callback an optional callback that can be called when the data are successfully loaded (certified or not). Useful for example to close synchronously a busy spinner once all data have been fetched.
 */
export const listNeurons = async ({
  callback,
}: {
  callback?: (certified: boolean) => void;
} = {}): Promise<void> => {
  return queryAndUpdate<NeuronInfo[], unknown>({
    request: ({ certified, identity }) => queryNeurons({ certified, identity }),
    onLoad: async ({ response: neurons, certified }) => {
      neuronsStore.setNeurons({ neurons, certified });

      callback?.(certified);
    },
    onError: ({ error, certified }) => {
      if (certified !== true) {
        return;
      }

      // Explicitly handle only UPDATE errors
      neuronsStore.setNeurons({ neurons: [], certified });

      toastsStore.error({
        labelKey: "error.get_neurons",
        err: error,
      });
    },
  });
};

// We always want to call this with the user identity
const getAndLoadNeuron = async (neuronId: NeuronId) => {
  const identity = await getIdentity();
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
    const neuronIdentity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );
    await increaseDissolveDelay({
      neuronId,
      dissolveDelayInSeconds,
      identity: neuronIdentity,
    });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));
    // To inform there was an error
    return undefined;
  }
};

export const toggleCommunityFund = async (
  neuron: NeuronInfo
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuron.neuronId
    );

    if (hasJoinedCommunityFund(neuron)) {
      await leaveCommunityFund({
        neuronId: neuron.neuronId,
        identity,
      });
    } else {
      await joinCommunityFund({ neuronId: neuron.neuronId, identity });
    }

    await getAndLoadNeuron(neuron.neuronId);

    return neuron.neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
  }
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
    const { neuron: neuron1 } = await getIdentityAndNeuronHelper(
      sourceNeuronId
    );
    const { neuron: neuron2 } = await getIdentityAndNeuronHelper(
      targetNeuronId
    );
    const { isValid, messageKey } = canBeMerged([neuron1, neuron2]);
    if (!isValid) {
      throw new CannotBeMerged(
        translate({ labelKey: messageKey ?? "error.governance_error" })
      );
    }
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      targetNeuronId
    );

    await mergeNeuronsApi({ sourceNeuronId, targetNeuronId, identity });
    success = true;

    await listNeurons();

    return targetNeuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return success ? targetNeuronId : undefined;
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

    const identity: Identity = await getIdentity();
    const ledgerIdentity = await getLedgerIdentityProxy(accountIdentifier);

    await addHotkeyApi({
      neuronId,
      identity: ledgerIdentity,
      principal: identity.getPrincipal(),
    });

    await getAndLoadNeuron(neuronId);

    stopBusy("add-hotkey-neuron");

    toastsStore.success({
      labelKey: "neurons.add_user_as_hotkey_success",
    });

    return { success: true };
  } catch (err) {
    // TODO: Manage edge cases https://dfinity.atlassian.net/browse/L2-526

    stopBusy("add-hotkey-neuron");

    const toastMsg = mapNeuronErrorToToastMessage(err);

    toastsStore.show(toastMsg);

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
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await addHotkeyApi({ neuronId, identity, principal });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

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
    toastsStore.error({
      labelKey: "neuron_detail.invalid_hotkey",
    });
    return;
  }
  let removed = false;
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await removeHotkeyApi({ neuronId, identity, principal });
    removed = true;

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    if (removed && err instanceof NotAuthorizedNeuronError) {
      // There is no need to get the identity unless removing the hotkey succeeded
      // and it was `getAndLoadNeuron` that threw the error.
      const currentIdentityPrincipal = (await getIdentity())
        .getPrincipal()
        .toText();
      // This happens when a user removes itself from the hotkeys.
      return principalString === currentIdentityPrincipal
        ? neuronId
        : undefined;
    }

    toastsStore.show(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
  }
};

export const splitNeuron = async ({
  neuronId,
  amount,
}: {
  neuronId: NeuronId;
  amount: number;
}): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    const fee = get(mainTransactionFeeStore);
    const transactionFeeAmount = fee / E8S_PER_ICP;
    const stake = convertNumberToICP(amount + transactionFeeAmount);

    if (!isEnoughToStakeNeuron({ stake, fee })) {
      throw new InsufficientAmountError();
    }

    await splitNeuronApi({ neuronId, identity, amount: stake });

    await listNeurons();

    return neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));
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
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await disburseApi({ neuronId, toAccountId, identity });

    await Promise.all([syncAccounts(), listNeurons()]);

    return { success: true };
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    return { success: false };
  }
};

export const mergeMaturity = async ({
  neuronId,
  percentageToMerge,
}: {
  neuronId: NeuronId;
  percentageToMerge: number;
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await assertLedgerVersion({
      identity,
      minVersion: MIN_VERSION_MERGE_MATURITY,
    });

    await mergeMaturityApi({ neuronId, percentageToMerge, identity });

    await getAndLoadNeuron(neuronId);

    return { success: true };
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

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
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    const newNeuronId = await spawnNeuronApi({
      neuronId,
      percentageToSpawn,
      identity,
    });

    await listNeurons();

    return newNeuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    return undefined;
  }
};

export const startDissolving = async (
  neuronId: NeuronId
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await startDissolvingApi({ neuronId, identity });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    return undefined;
  }
};

export const stopDissolving = async (
  neuronId: NeuronId
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await stopDissolvingApi({ neuronId, identity });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

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
    let identity: Identity = await getIdentity();
    if (!isHotKeyControllable({ neuron, identity })) {
      identity = await getIdentityOfControllerByNeuronId(neuron.neuronId);
    }
    // ManageNeuron topic followes can only be handled by controllers
    if (topic === Topic.ManageNeuron) {
      identity = await getIdentityOfControllerByNeuronId(neuron.neuronId);
    }
    await setFollowees({
      identity,
      neuronId: neuron.neuronId,
      topic,
      followees,
    });
    await getAndLoadNeuron(neuron.neuronId);
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));
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
  // Do not allow a neuron to follow itself
  if (followee === neuronId) {
    toastsStore.error({
      labelKey: "new_followee.same_neuron",
    });
    return;
  }
  const neuron = getNeuronFromStore(neuronId);

  const topicFollowees = followeesByTopic({ neuron, topic });
  // Do not allow to add a neuron id who is already followed
  if (topicFollowees !== undefined && topicFollowees.includes(followee)) {
    toastsStore.error({
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
    toastsStore.error({
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
  skipCheck?: boolean;
  setNeuron: (params: { neuron: NeuronInfo; certified: boolean }) => void;
  handleError?: () => void;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  const catchError = (err: unknown) => {
    if (err instanceof NotFoundError) {
      toastsStore.error({
        labelKey: "error.neuron_not_found",
        err,
      });
    } else {
      toastsStore.error({
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
    onError: ({ error, certified }) => {
      console.error(error);

      if (certified !== true) {
        return;
      }
      catchError(error);
    },
  });
};

// Not resolve until the neuron has been loaded
export const reloadNeuron = (neuronId: NeuronId) =>
  new Promise<void>((resolve) => {
    getIdentity()
      // To update the neuron stake with the subaccount balance
      .then((identity) => claimOrRefreshNeuron({ identity, neuronId }))
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

export const makeDummyProposals = async (neuronId: NeuronId): Promise<void> => {
  // Only available in testnet
  if (!IS_TESTNET) {
    return;
  }
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );
    const { snsSummariesStore } = await import("../stores/sns.store");
    const projects = get(snsSummariesStore);
    const pendingProject = projects.find(
      ({
        swap: {
          state: { lifecycle },
        },
        // Use 1 instead of using enum to avoid importing sns-js
      }) => lifecycle === 1
    );
    await makeDummyProposalsApi({
      neuronId,
      identity,
      swapCanisterId: pendingProject?.swapCanisterId.toText(),
    });
    toastsStore.success({
      labelKey: "neuron_detail.dummy_proposal_success",
    });
    return;
  } catch (error) {
    console.error(error);
    toastsStore.show(mapNeuronErrorToToastMessage(error));
  }
};

export const routePathNeuronId = (path: string): NeuronId | undefined => {
  if (!isRoutePath({ path: AppPath.NeuronDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetailId(path);
};
