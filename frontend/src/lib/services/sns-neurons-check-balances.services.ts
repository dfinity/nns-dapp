import {
  claimNeuron,
  getNeuronBalance,
  refreshNeuron,
} from "$lib/api/sns-governance.api";
import { getSnsNeuron } from "$lib/api/sns.api";
import { MAX_NEURONS_SUBACCOUNTS } from "$lib/constants/sns-neurons.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import {
  getSnsNeuronIdAsHexString,
  needsRefresh,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import {
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
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
  subaccount: Uint8Array;
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

const findNeuronBySubaccount =
  (subaccount: Uint8Array) => (neuron: SnsNeuron) =>
    getSnsNeuronIdAsHexString(neuron) === subaccountToHexString(subaccount);

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
 * - The SNS UI notifies the SNS Governance of all the neuron subaccounts that
 *   - Have a balance different from 0 but the list of neurons doesn’t list them as neurons.
 *     - In this case, the client need to claim the neuron.
 *   - Have a balance different from the cached_neuron_stake_e8s returned by the SNS Governance
 *     - In this case, the client needs to refresh the neuron.
 *
 * SUMMARY:
 *
 * -------------------------------------------------
 * |              |  Balance 0     | Balance > 0   |
 * | found neuron |  check neuron stake vs balance |
 * | no neuron    |  stop checking | claim neuron  |
 * -------------------------------------------------
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
      currentBalance = BigInt(0);
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
      const neuron = neurons.find(findNeuronBySubaccount(subaccount));
      const neuronNotFound = neuron === undefined;
      const positiveBalance = currentBalance >= neuronMinimumStake;
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
          loadNeuron({
            rootCanisterId,
            neuronId: neuronId,
            certified: true,
            identity,
          });
        }
      }
      // If the balance is 0 and there is no neuron in that subaccount, stop checking.
      if (currentBalance === BigInt(0) && neuronNotFound) {
        break;
      }
    } catch (error) {
      // Ignore the error, we do this in the background.
      // If this fails the data might be stale but it should refreshed on the next sync.
      console.error(error);
    }
  }
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
    const neuronId = fromNullable(neuron.id);
    if (neuronId !== undefined) {
      if (await neuronNeedsRefresh({ rootCanisterId, neuron, identity })) {
        await refreshNeuron({ rootCanisterId, identity, neuronId });
        loadNeuron({
          rootCanisterId,
          neuronId: neuronId,
          certified: true,
          identity,
        });
      }
    }
  }
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
 * `NervousSystemParameters` should be preloaded before calling this function.
 *
 * @param param0
 * @returns {boolean}
 */
export const checkSnsNeuronBalances = async ({
  rootCanisterId,
  neurons,
}: {
  rootCanisterId: Principal;
  neurons: SnsNeuron[];
}): Promise<void> => {
  // TODO: Check neurons controlled by linked HW?
  const identity = await getAuthenticatedIdentity();

  // TODO: refactor using `getSnsParametersFromStore` https://dfinity.atlassian.net/browse/GIX-1178
  const neuronMinimumStake = fromDefinedNullable(
    (
      get(snsParametersStore)?.[rootCanisterId.toText()]
        ?.parameters as NervousSystemParameters
    ).neuron_minimum_stake_e8s ?? [0n]
  );

  const unvisitedNeurons = await checkNeuronsSubaccounts({
    identity,
    rootCanisterId,
    neurons,
    neuronMinimumStake,
  });

  await checkNeurons({ identity, rootCanisterId, neurons: unvisitedNeurons });
};
