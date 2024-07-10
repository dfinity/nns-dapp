import {
  claimNeuron,
  getNeuronBalance,
  getSnsNeuron,
  querySnsNeuron,
  refreshNeuron,
} from "$lib/api/sns-governance.api";
import { MAX_NEURONS_SUBACCOUNTS } from "$lib/constants/sns-neurons.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import {
  getSnsNeuronIdAsHexString,
  needsRefresh,
  nextMemo,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
import { neuronSubaccount } from "@dfinity/sns";
import { fromDefinedNullable, fromNullable, isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

const loadNeuron = async ({
  rootCanisterId,
  neuronId,
  certified,
  identity,
}: {
  rootCanisterId: Principal;
  neuronId: SnsNeuronId;
  certified: boolean;
  identity: Identity;
}): Promise<void> => {
  const neuron = await getSnsNeuron({
    identity,
    rootCanisterId,
    neuronId,
    certified,
  });
  snsNeuronsStore.addNeurons({
    rootCanisterId,
    certified,
    neurons: [neuron],
  });
};

/**
 * Returns true if the neuron's stake doesn't match the balance of the subaccount.
 *
 * @param params
 * @param {Principal} params.rootCanisterId
 * @param {SnsNeuron} params.neuron
 * @param {Identity} params.identity
 * @param {bigint} params.balanceE8s
 * @returns {Promise<boolean>}
 */
export const neuronNeedsRefresh = async ({
  rootCanisterId,
  neuron,
  identity,
}: {
  rootCanisterId: Principal;
  neuron: SnsNeuron;
  identity: Identity;
}): Promise<boolean> => {
  const neuronId = fromNullable(neuron.id);
  // Edge case, a valid neuron should have a neuron id
  if (neuronId === undefined) {
    return false;
  }
  // We use certified: false for performance reasons.
  // A bad actor will only get that we call refresh on a neuron.
  const balanceE8s = await getNeuronBalance({
    rootCanisterId,
    neuronId,
    certified: false,
    identity,
  });
  return needsRefresh({ neuron, balanceE8s });
};

const claimAndLoadNeuron = async ({
  rootCanisterId,
  identity,
  controller,
  memo,
  subaccount,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  controller: Principal;
  memo: bigint;
  subaccount: Uint8Array | number[];
}): Promise<void> => {
  // There is a subaccount with balance and no neuron. Claim it.
  const neuronId = await claimNeuron({
    rootCanisterId,
    identity,
    memo,
    controller,
    subaccount,
  });
  // No need to wait for this to continue with the checks.
  loadNeuron({
    neuronId,
    rootCanisterId,
    certified: true,
    identity,
  });
};

const findNeuronBySubaccount = async ({
  subaccount,
  neurons,
  rootCanisterId,
  positiveBalance,
}: {
  subaccount: Uint8Array | number[];
  neurons: SnsNeuron[];
  rootCanisterId: Principal;
  positiveBalance: boolean;
}): Promise<SnsNeuron | undefined> => {
  let maybeNeuron = neurons.find(
    (neuron) =>
      getSnsNeuronIdAsHexString(neuron) === subaccountToHexString(subaccount)
  );
  // At this point we don't know whether it's an unclaimed or transferred neuron.
  if (isNullish(maybeNeuron) && positiveBalance) {
    const neuronId: SnsNeuronId = { id: subaccount };
    maybeNeuron = await querySnsNeuron({
      identity: new AnonymousIdentity(),
      rootCanisterId,
      neuronId,
      // No need to check with update call, worst case, a neuron will appear in the UI that shouldn't or an extra call to refressh will be made.
      certified: false,
    });
  }
  return maybeNeuron;
};

/**
 * Returns true only of neuron is present and the user has no permissions.
 *
 * If there is no neuron, it returns false.
 * If the user has any permission, it returns false.
 */
const userHasNoPermissions = ({
  neuron,
  controller,
}: {
  neuron: SnsNeuron | undefined;
  controller: Principal;
}): boolean =>
  isNullish(neuron)
    ? false
    : !neuron.permissions.some(({ principal, permission_type }) => {
        return (
          principal[0]?.toText() === controller.toText() &&
          permission_type.length > 0
        );
      });

/**
 * Checks subaccounts of identity in order to find neurons that need to be refreshed or claimed.
 *
 * Neuron subaccount is { sha256(0x0c . “neuron-stake” . P . i) | i ∈ ℕ }
 *
 * The main property of this is that it is always possible to recompute all the neurons subaccounts of a principal.
 * This can be used to make the SNS UI stateless, which then means that the SNS UI can fail at any time
 * without losing any important information needed to derive accounts.
 *
 * Neurons subaccounts of a principal must be used in order of i.
 * The first account of P is sha256(0x0c . “neuron-staking” . P . 0), the second one is sha256(0x0c . “neuron-staking” . P . 1) …
 * This allows any client to verify the state of neurons subaccounts that have received a transfer without checking all the ns subaccounts.
 *
 * A stateless SNS UI will perform the following operations every time it starts:
 * - It gets the list of neurons from the SNS Governance using list_neurons. This is done via an update call to confirm the correctness of the data.
 * - It calculates all its ns subaccounts and then checks their balances via query calls. This is where the ordering of ns subaccounts comes into play: the client just needs to check the ns subaccounts that are either already neuron accounts returned in 1. or have a balance different from 0.
 * - The SNS UI notifies the SNS Governance of all the neuron subaccounts that the user has some permission and:
 *   - Have a balance different from 0 but the list of neurons doesn’t list them as neurons.
 *     - In this case, the client needs to claim the neuron.
 *   - Have a balance different from the cached_neuron_stake_e8s returned by the SNS Governance
 *     - In this case, the client needs to refresh the neuron.
 *
 * SUMMARY:
 *
 * -------------------------------------------------------------------
 * |                                |  Balance 0     | Balance > 0   |
 * | found neuron (with permission) |  check neuron stake vs balance |
 * | no neuron                      |  stop checking | claim neuron  |
 * -------------------------------------------------------------------
 *
 * @param {Object}
 * @param {Principal} params.rootCanisterId
 * @param {SnsNeuron[]} params.neurons neurons to check
 * @param {Identity} params.identity
 * @returns
 */
const checkNeuronsSubaccounts = async ({
  identity,
  rootCanisterId,
  neurons,
  neuronMinimumStake,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neurons: SnsNeuron[];
  neuronMinimumStake: bigint;
}): Promise<SnsNeuron[]> => {
  const visitedSubaccounts = new Set<string>();
  const controller = identity.getPrincipal();
  // Visit subaccounts by order until we find a balance of 0.
  // Therefore, we set the initial balance to some non-zero value.
  let currentBalance = BigInt(Number.MAX_SAFE_INTEGER);
  for (let index = 0; index < MAX_NEURONS_SUBACCOUNTS; index++) {
    try {
      // In case there is an error getting the balance, the loop stops.
      currentBalance = 0n;
      const subaccount = neuronSubaccount({
        controller,
        index,
      });
      // Id of an sns neuron is the subaccount of the sns governance canister where the stake is
      const currentNeuronId: SnsNeuronId = { id: subaccount };
      visitedSubaccounts.add(subaccountToHexString(subaccount));
      // We use certified: false for performance reasons.
      // A bad actor will only get that we call refresh or claim on a neuron.
      currentBalance = await getNeuronBalance({
        rootCanisterId,
        neuronId: currentNeuronId,
        certified: false,
        identity,
      });
      const positiveBalance = currentBalance >= neuronMinimumStake;
      // At this point we don't know whether it's an unclaimed or transferred neuron.
      const neuron = await findNeuronBySubaccount({
        subaccount,
        neurons,
        rootCanisterId,
        positiveBalance,
      });
      // Skip claiming or refreshing if the user has no permission.
      // This might happen if the user staked the neuron in NNS Dapp and then transferred it.
      if (userHasNoPermissions({ neuron, controller })) {
        continue;
      }
      const neuronNotFound = neuron === undefined;
      // Subaccount balance >= `neuron_minimum_stake_e8s` but no neuron found, claim it.
      if (positiveBalance && neuronNotFound) {
        await claimAndLoadNeuron({
          rootCanisterId,
          identity,
          controller,
          memo: BigInt(index),
          subaccount,
        });
      }
      // Neuron found, check if it needs to be refreshed.
      if (
        neuron !== undefined &&
        needsRefresh({ neuron, balanceE8s: currentBalance })
      ) {
        // Edge case, a valid neuron should have a neuron id
        const neuronId = fromNullable(neuron.id);
        if (neuronId !== undefined) {
          await refreshNeuron({ rootCanisterId, identity, neuronId });
          await loadNeuron({
            rootCanisterId,
            neuronId: neuronId,
            certified: true,
            identity,
          });
        }
      }
      // If the balance is 0 and there is no neuron in that subaccount, stop checking.
      if (currentBalance === 0n && neuronNotFound) {
        break;
      }
    } catch (error) {
      // Ignore the error, we do this in the background.
      // If this fails the data might be stale but it should refreshed on the next sync.
      console.error(error);
    }
  }
  // Not all neurons that the user has some permission need to be created in NNS Dapp.
  // Some of those neurons might need a refresh as well.
  // That's done in another function, here we only return them.
  const unvisitedNeurons = neurons.filter(
    ({ id }) =>
      !visitedSubaccounts.has(
        subaccountToHexString(fromNullable(id)?.id ?? new Uint8Array())
      )
  );
  return unvisitedNeurons;
};

/**
 * Checks neurons subaccounts and refreshes neurons that need it.
 *
 * @param {Object}
 * @param {Principal} params.rootCanisterId
 * @param {SnsNeuron[]} params.neurons neurons to check
 * @param {Identity} params.identity
 * @returns
 */
const checkNeurons = async ({
  identity,
  rootCanisterId,
  neurons,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neurons: SnsNeuron[];
}) => {
  for (const neuron of neurons) {
    await checkNeuron({ identity, rootCanisterId, neuron });
  }
};

/**
 * Checks neuron's subaccount and refreshes the neuron if needed.
 * Returns true if the neuron was refreshed.
 */
const checkNeuron = async ({
  identity,
  rootCanisterId,
  neuron,
}: {
  identity: Identity;
  rootCanisterId: Principal;
  neuron: SnsNeuron;
}): Promise<boolean> => {
  const neuronId = fromNullable(neuron.id);
  if (
    isNullish(neuronId) ||
    !(await neuronNeedsRefresh({ rootCanisterId, neuron, identity }))
  ) {
    return false;
  }
  await refreshNeuron({ rootCanisterId, identity, neuronId });
  await loadNeuron({
    rootCanisterId,
    neuronId: neuronId,
    certified: true,
    identity,
  });
  return true;
};

/**
 * Checks a couple of things:
 * - Neurons subaccounts balances and refreshes or claims neurons that need it.
 *   - This follows a new staking neuron algorithm explained in the helper `checkNeuronsSubaccounts`
 * - Check the rest of the neurons and refreshes them if needed.
 *
 * It refetches the neurons that are not in sync with the subaccounts and adds them to the store.
 *
 * Note:
 * `SnsNervousSystemParameters` should be preloaded before calling this function.
 *
 * @param param0
 * @returns {boolean}
 */
export const checkSnsNeuronBalances = async ({
  rootCanisterId,
  neurons,
  neuronMinimumStake,
}: {
  rootCanisterId: Principal;
  neurons: SnsNeuron[];
  neuronMinimumStake: bigint;
}): Promise<void> => {
  // TODO: Check neurons controlled by linked HW?
  const identity = await getAuthenticatedIdentity();
  const unvisitedNeurons = await checkNeuronsSubaccounts({
    identity,
    rootCanisterId,
    neurons,
    neuronMinimumStake,
  });

  await checkNeurons({ identity, rootCanisterId, neurons: unvisitedNeurons });
};

// Returns true if the neuron was refreshed.
export const refreshNeuronIfNeeded = async ({
  rootCanisterId,
  neuron,
}: {
  rootCanisterId: Principal | undefined;
  neuron: SnsNeuron | null | undefined;
}): Promise<boolean> => {
  if (isNullish(rootCanisterId) || isNullish(neuron)) {
    return false;
  }
  // An SNS neuron's ID is the same as its subaccount.
  const subaccountHex = getSnsNeuronIdAsHexString(neuron);
  const universeId = rootCanisterId.toText();

  // We only check neurons to recover from an interrupted stake/top-up.
  // Doing this once per neuron per session is often enough.
  if (
    !checkedNeuronSubaccountsStore.addSubaccount({
      universeId,
      subaccountHex,
    })
  ) {
    return false;
  }

  const identity = await getAuthenticatedIdentity();
  return checkNeuron({
    identity,
    rootCanisterId,
    neuron,
  });
};

const getNeuronMinimumStake = async ({
  rootCanisterId,
}: {
  rootCanisterId: Principal;
}): Promise<bigint> => {
  await loadSnsParameters(rootCanisterId);
  return fromDefinedNullable(
    get(snsParametersStore)?.[rootCanisterId.toText()]?.parameters
      ?.neuron_minimum_stake_e8s
  );
};

const claimNeuronIfNeeded = async ({
  rootCanisterId,
  memo,
  subaccount,
  identity,
}: {
  rootCanisterId: Principal;
  memo: bigint;
  subaccount: Uint8Array | number[];
  identity: Identity;
}): Promise<void> => {
  // We only check neurons to recover from an interrupted stake/top-up.
  // Doing this once per neuron per session is often enough.
  if (
    !checkedNeuronSubaccountsStore.addSubaccount({
      universeId: rootCanisterId.toText(),
      subaccountHex: subaccountToHexString(subaccount),
    })
  ) {
    return;
  }

  const neuronId: SnsNeuronId = { id: subaccount };
  // We use certified: false for performance reasons.
  // A bad actor will only get that we call refresh or claim on a neuron.
  const neuronAccountBalance = await getNeuronBalance({
    rootCanisterId,
    neuronId,
    certified: false,
    identity,
  });

  if (neuronAccountBalance === 0n) {
    return;
  }

  const neuronMinimumStake = await getNeuronMinimumStake({ rootCanisterId });
  // Don't claim a neuron if there's not enough balance to stake.
  if (neuronAccountBalance < neuronMinimumStake) {
    return;
  }

  await claimAndLoadNeuron({
    rootCanisterId,
    identity,
    controller: identity.getPrincipal(),
    memo,
    subaccount,
  });
};

export const claimNextNeuronIfNeeded = async ({
  rootCanisterId,
  neurons,
}: {
  rootCanisterId: Principal | undefined;
  neurons: SnsNeuron[] | undefined;
}): Promise<void> => {
  if (isNullish(rootCanisterId)) {
    return;
  }
  if (isNullish(neurons)) {
    return;
  }
  const identity = await getAuthenticatedIdentity();
  const memo = nextMemo({
    identity,
    neurons,
  });
  const subaccount = neuronSubaccount({
    controller: identity.getPrincipal(),
    index: Number(memo),
  });
  await claimNeuronIfNeeded({
    rootCanisterId,
    memo,
    subaccount,
    identity,
  });
};
