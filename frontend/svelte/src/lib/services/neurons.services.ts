import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import {
  Topic,
  type ICP,
  type Neuron,
  type NeuronId,
  type NeuronInfo,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { makeDummyProposals as makeDummyProposalsApi } from "../api/dev.api";
import {
  addHotkey as addHotkeyApi,
  claimOrRefreshNeuron,
  disburse as disburseApi,
  increaseDissolveDelay,
  joinCommunityFund as joinCommunityFundApi,
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
import { getNeuronBalance } from "../api/ledger.api";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";
import { IS_TESTNET } from "../constants/environment.constants";
import { E8S_PER_ICP } from "../constants/icp.constants";
import { MAX_CONCURRENCY } from "../constants/neurons.constants";
import type { LedgerIdentity } from "../identities/ledger.identity";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import { definedNeuronsStore, neuronsStore } from "../stores/neurons.store";
import { toastsStore } from "../stores/toasts.store";
import type { Account } from "../types/account";
import {
  CannotBeMerged,
  InsufficientAmountError,
  NotAuthorizedError,
  NotFoundError,
} from "../types/errors";
import { isAccountHardwareWallet } from "../utils/accounts.utils";
import { getLastPathDetailId } from "../utils/app-path.utils";
import { mapNeuronErrorToToastMessage } from "../utils/error.utils";
import { translate } from "../utils/i18n.utils";
import {
  canBeMerged,
  convertNumberToICP,
  followeesByTopic,
  isEnoughToStakeNeuron,
  isHotKeyControllable,
  isIdentityController,
} from "../utils/neuron.utils";
import { createChunks, isDefined } from "../utils/utils";
import {
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  syncAccounts,
} from "./accounts.services";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

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

const getIdentityOfControllerByNeuronId = async (
  neuronId: NeuronId
): Promise<Identity> => {
  const { neuron } = await getIdentityAndNeuronHelper(neuronId);

  if (
    neuron.fullNeuron === undefined ||
    neuron.fullNeuron.controller === undefined
  ) {
    throw new NotAuthorizedError();
  }

  const neuronIdentity = await getAccountIdentityByPrincipal(
    neuron.fullNeuron.controller
  );
  // `getAccountIdentityByPrincipal` returns the current user identity (because of `getIdentity`) if the account is not a hardware wallet.
  // If we enable visiting neurons which are not ours, we will need this service to throw `NotAuthorizedError`.
  if (isIdentityController({ neuron, identity: neuronIdentity })) {
    return neuronIdentity;
  }

  throw new NotAuthorizedError();
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
 */
export const stakeNeuron = async ({
  amount,
  account,
}: {
  amount: number;
  account: Account;
}): Promise<NeuronId | undefined> => {
  try {
    const stake = convertNumberToICP(amount);

    if (!isEnoughToStakeNeuron({ stake })) {
      toastsStore.error({
        labelKey: "error.amount_not_enough",
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
    return await stakeNeuronApi({
      stake,
      identity,
      ledgerCanisterIdentity,
      controller,
      fromSubAccount,
    });
  } catch (err) {
    toastsStore.error({
      labelKey: "error.stake_neuron",
      err,
    });
  }
};

/**
 * This gets all neurons linked to the current user's principal, even those with a stake of 0. And adds them to the store
 *
 * @param {Object} params
 * @param {skipCheck} params.skipCheck it true, the neurons' balance won't be checked and those that are not synced won't be refreshed. Useful because the function `checkNeuronBalances` that does this check might ultimately call the current function `listNeurons` again.
 * @param {callback} params.callback an optional callback that can be called when the data are successfully loaded (certified or not). Useful for example to close synchronously a busy spinner once all data have been fetched.
 */
export const listNeurons = async ({
  skipCheck = false,
  callback,
}: {
  skipCheck?: boolean;
  callback?: (certified: boolean) => void;
} = {}): Promise<void> => {
  return queryAndUpdate<NeuronInfo[], unknown>({
    request: ({ certified, identity }) => queryNeurons({ certified, identity }),
    onLoad: async ({ response: neurons, certified }) => {
      neuronsStore.setNeurons({ neurons, certified });

      callback?.(certified);

      if (!certified || skipCheck) {
        return;
      }
      // Query the ledger for each neuron
      // refresh those whose stake does not match their ledger balance.
      try {
        await checkNeuronBalances(neurons);
      } catch (error) {
        // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-424
        console.error(error);
      }
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

const balanceMatchesStake = ({
  balance,
  fullNeuron,
}: {
  balance: ICP;
  fullNeuron: Neuron;
}): boolean => balance.toE8s() === fullNeuron.cachedNeuronStake;

const balanceIsMoreThanOne = ({ balance }: { balance: ICP }): boolean =>
  balance.toE8s() > E8S_PER_ICP;

const findNeuronsStakeNotBalance = async ({
  neurons,
  identity,
}: {
  neurons: Neuron[];
  identity: Identity;
}): Promise<NeuronId[]> => {
  // TODO switch to getting multiple balances in a single request once it is supported by the ledger.
  // Until the above is supported we must limit the max concurrency otherwise our requests may be throttled.

  const neuronChunks: Neuron[][] = createChunks(neurons, MAX_CONCURRENCY);

  let neuronIdsToRefresh: NeuronId[] = [];

  for (const neuronChunk of neuronChunks) {
    const notMatchingNeuronIds: NeuronId[] = (
      await getNeuronsBalance({ neurons: neuronChunk, identity })
    )
      .filter((params) => !balanceMatchesStake(params))
      // We can only refresh a neuron if its balance is at least 1 ICP
      .filter(balanceIsMoreThanOne)
      .map(({ fullNeuron }) => fullNeuron.id)
      .filter(isDefined);

    neuronIdsToRefresh = [...neuronIdsToRefresh, ...notMatchingNeuronIds];
  }

  return neuronIdsToRefresh;
};

const getNeuronsBalance = async ({
  neurons,
  identity,
}: {
  neurons: Neuron[];
  identity: Identity;
}): Promise<
  {
    balance: ICP;
    fullNeuron: Neuron;
  }[]
> =>
  Promise.all(
    neurons.map(
      async (fullNeuron): Promise<{ balance: ICP; fullNeuron: Neuron }> => ({
        // NOTE: We fetch the balance in an uncertified way as it's more efficient,
        // and a malicious actor wouldn't gain anything by spoofing this value.
        // This data is used only to now which neurons need to be refreshed.
        // This data is not shown to the user, nor stored in any store.
        balance: await getNeuronBalance({
          neuron: fullNeuron,
          identity,
          certified: false,
        }),
        fullNeuron,
      })
    )
  );

const claimNeurons =
  (identity: Identity) =>
  (neuronIds: NeuronId[]): Promise<Array<NeuronId | undefined>> =>
    Promise.all(
      neuronIds.map((neuronId) => claimOrRefreshNeuron({ identity, neuronId }))
    );

const checkNeuronBalances = async (neurons: NeuronInfo[]): Promise<void> => {
  const identity = await getIdentity();

  const fullNeurons: Neuron[] = neurons
    .map(({ fullNeuron }) => fullNeuron)
    .filter(isDefined);

  if (fullNeurons.length === 0) {
    return;
  }

  const neuronIdsToRefresh: NeuronId[] = await findNeuronsStakeNotBalance({
    neurons: fullNeurons,
    identity,
  });

  if (neuronIdsToRefresh.length === 0) {
    return;
  }

  // We found neurons that need to be refreshed.
  const neuronIdsChunks: NeuronId[][] = createChunks(
    neuronIdsToRefresh,
    MAX_CONCURRENCY
  );
  await Promise.all(neuronIdsChunks.map(claimNeurons(identity)));

  return listNeurons({ skipCheck: true });
};

// We always want to call this with the user identity
export const getAndLoadNeuron = async (neuronId: NeuronId) => {
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

export const joinCommunityFund = async (
  neuronId: NeuronId
): Promise<NeuronId | undefined> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await joinCommunityFundApi({ neuronId, identity });

    await getAndLoadNeuron(neuronId);

    return neuronId;
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

    await listNeurons({ skipCheck: true });

    return targetNeuronId;
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return success ? targetNeuronId : undefined;
  }
};

// This service is used when creating a new neuron from a Hardware Wallet.
// The new neuron is not yet in the neuronsStore because the user should add first a hotkey to make nns-dapp control the neuron on the hardware wallet.
export const addHotkeyFromHW = async ({
  neuronId,
  principal,
  accountIdentifier,
}: {
  neuronId: NeuronId;
  principal: Principal;
  accountIdentifier: string;
}): Promise<NeuronId | undefined> => {
  try {
    const ledgerIdentity = await getLedgerIdentityProxy(accountIdentifier);

    await addHotkeyApi({ neuronId, identity: ledgerIdentity, principal });

    return neuronId;
  } catch (err) {
    // TODO: Manage edge cases https://dfinity.atlassian.net/browse/L2-526
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    // To inform there was an error
    return undefined;
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
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await removeHotkeyApi({ neuronId, identity, principal });

    await getAndLoadNeuron(neuronId);

    return neuronId;
  } catch (err) {
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

    const stake = convertNumberToICP(amount);

    if (!isEnoughToStakeNeuron({ stake, withTransactionFee: true })) {
      throw new InsufficientAmountError();
    }

    await splitNeuronApi({ neuronId, identity, amount: stake });
    toastsStore.success({
      labelKey: "neuron_detail.split_neuron_success",
    });

    await getAndLoadNeuron(neuronId);

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

    await Promise.all([syncAccounts(), listNeurons({ skipCheck: true })]);

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
}): Promise<{ success: boolean }> => {
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );

    await spawnNeuronApi({ neuronId, percentageToSpawn, identity });

    await getAndLoadNeuron(neuronId);

    return { success: true };
  } catch (err) {
    toastsStore.show(mapNeuronErrorToToastMessage(err));

    return { success: false };
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
}: {
  neuronId: NeuronId;
  forceFetch?: boolean;
  setNeuron: (params: { neuron: NeuronInfo; certified: boolean }) => void;
  handleError?: () => void;
}): Promise<void> => {
  const catchError = (err: unknown) => {
    toastsStore.error({
      labelKey: "error.neuron_not_found",
      err,
    });

    handleError?.();
  };

  return queryAndUpdate<NeuronInfo | undefined, unknown>({
    request: (options) =>
      getNeuron({
        neuronId,
        forceFetch,
        ...options,
      }),
    onLoad: ({ response: neuron, certified }) => {
      if (neuron === undefined) {
        catchError(new Error("Neuron not found"));
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

export const makeDummyProposals = async (neuronId: NeuronId): Promise<void> => {
  // Only available in testnet
  if (!IS_TESTNET) {
    return;
  }
  try {
    const identity: Identity = await getIdentityOfControllerByNeuronId(
      neuronId
    );
    await makeDummyProposalsApi({
      neuronId,
      identity,
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

export const routePathNeuronId = (path: string): NeuronId | undefined =>
  getLastPathDetailId(path);
