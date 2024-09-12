import {
  claimNeuron,
  getNeuronBalance,
  getSnsNeuron,
  refreshNeuron,
} from "$lib/api/sns-governance.api";
import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { loadSnsParameters } from "$lib/services/sns-parameters.services";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  getSnsNeuronIdAsHexString,
  needsRefresh,
  nextMemo,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import type { Identity } from "@dfinity/agent";
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
  if (userHasNoPermissions({ neuron, controller: identity.getPrincipal() })) {
    // This neuron does not belong to the user.
    // It's possible for an SNS neuron to be transferred to another user
    // by removing the permissions for one user and adding permissions for
    // another user. For example idgeek.app has a service to sell SNS
    // neurons. This service also works with NNS dapp controlled neurons
    // because they fully take over your Internet Identity. Since this
    // will not change the ID of the neuron, it will still appear in the
    // sequence of neuron IDs for the original user. So we must take extra
    // care to make sure it does not appear in the UI for the original
    // user.
    return;
  }
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
