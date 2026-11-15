import { governanceApiService } from "$lib/api-services/governance.api-service";
import {
  addNeuronPermissions,
  removeNeuronPermissions,
} from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { listNeurons } from "$lib/services/neurons.services";
import { syncSnsNeurons } from "$lib/services/sns-neurons.services";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import type {
  HotkeyChange,
  HotkeyChangeResult,
  HotkeyNeuronRef,
} from "$lib/types/hotkeys";
import { mapPool } from "$lib/utils/reporting.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import type {
  SnsGovernanceDid,
  SnsNeuronPermissionType,
} from "@icp-sdk/canisters/sns";
import type { Identity } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

// `MAX_NUM_HOT_KEYS_PER_NEURON` in the NNS governance canister.
const MAX_NNS_NEURON_HOTKEYS = 10;
const MAX_PARALLEL_NEURON_CHANGES = 5;

/**
 * Runs `add` and `remove` in the order that a full neuron needs: a full neuron
 * needs a free slot before the add.
 */
const addAndRemove = async ({
  add,
  remove,
  isFull,
}: {
  add: () => Promise<void>;
  remove: () => Promise<void>;
  isFull: boolean;
}) => {
  if (isFull) {
    await remove();
    await add();
    return;
  }
  await add();
  await remove();
};

const changeNnsNeuronHotkey = async ({
  identity,
  change,
  neuronId,
}: {
  identity: Identity;
  change: HotkeyChange;
  neuronId: string;
}) => {
  const neuron = get(neuronsStore).neurons?.find(
    (neuron) => neuron.neuronId.toString() === neuronId
  );
  const hotKeys = neuron?.fullNeuron?.hotKeys;
  if (isNullish(neuron) || isNullish(hotKeys)) {
    throw new Error(`NNS neuron ${neuronId} not found`);
  }

  const remove = async () => {
    if (hotKeys.includes(change.principal)) {
      await governanceApiService.removeHotkey({
        neuronId: neuron.neuronId,
        identity,
        principal: Principal.fromText(change.principal),
      });
    }
  };

  if (change.type === "remove") {
    await remove();
    return;
  }

  const needsAdd = !hotKeys.includes(change.newPrincipal);
  await addAndRemove({
    add: async () => {
      if (needsAdd) {
        await governanceApiService.addHotkey({
          neuronId: neuron.neuronId,
          identity,
          principal: Principal.fromText(change.newPrincipal),
        });
      }
    },
    remove,
    isFull: needsAdd && hotKeys.length >= MAX_NNS_NEURON_HOTKEYS,
  });
};

const getSnsPermissionTypes = ({
  neuron,
  principal,
}: {
  neuron: SnsGovernanceDid.Neuron;
  principal: string;
}): SnsNeuronPermissionType[] =>
  Array.from(
    neuron.permissions.find(
      (permission) => fromNullable(permission.principal)?.toText() === principal
    )?.permission_type ?? []
  );

const changeSnsNeuronHotkey = async ({
  identity,
  change,
  universeId,
  neuronId,
}: {
  identity: Identity;
  change: HotkeyChange;
  universeId: string;
  neuronId: string;
}) => {
  const neuron = get(snsNeuronsStore)[universeId]?.neurons.find(
    (neuron) => getSnsNeuronIdAsHexString(neuron) === neuronId
  );
  if (isNullish(neuron)) {
    throw new Error(`SNS neuron ${neuronId} not found`);
  }
  const rootCanisterId = Principal.fromText(universeId);
  const snsNeuronId = fromDefinedNullable(neuron.id);

  // Removes all the permissions of the principal, so it has no access left.
  const currentPermissions = getSnsPermissionTypes({
    neuron,
    principal: change.principal,
  });
  const remove = async () => {
    if (currentPermissions.length > 0) {
      await removeNeuronPermissions({
        identity,
        rootCanisterId,
        permissions: currentPermissions,
        principal: Principal.fromText(change.principal),
        neuronId: snsNeuronId,
      });
    }
  };

  if (change.type === "remove") {
    await remove();
    return;
  }

  const newPrincipalPermissions = getSnsPermissionTypes({
    neuron,
    principal: change.newPrincipal,
  });
  // The new hotkey gets the hotkey permissions of the NNS dapp, never more.
  const missingPermissions = HOTKEY_PERMISSIONS.filter(
    (permission) => !newPrincipalPermissions.includes(permission)
  );
  const maxPrincipals = fromNullable(
    get(snsParametersStore)[universeId]?.parameters
      .max_number_of_principals_per_neuron ?? []
  );
  await addAndRemove({
    add: async () => {
      if (missingPermissions.length > 0) {
        await addNeuronPermissions({
          identity,
          rootCanisterId,
          permissions: missingPermissions,
          principal: Principal.fromText(change.newPrincipal),
          neuronId: snsNeuronId,
        });
      }
    },
    remove,
    isFull:
      newPrincipalPermissions.length === 0 &&
      nonNullish(maxPrincipals) &&
      BigInt(neuron.permissions.length) >= maxPrincipals,
  });
};

const reloadNeurons = (universeIds: string[]) =>
  Promise.all(
    [...new Set(universeIds)].map((universeId) =>
      universeId === OWN_CANISTER_ID_TEXT
        ? listNeurons({ strategy: "update" })
        : syncSnsNeurons(Principal.fromText(universeId), { strategy: "update" })
    )
  );

/**
 * Replaces or removes a hotkey on the given neurons, then loads the certified neurons again.
 *
 * Each neuron changes from its current state in the store, so a second run on a
 * neuron that failed half way only does the missing steps.
 */
export const changeHotkeyOnNeurons = async ({
  change,
  neurons,
}: {
  change: HotkeyChange;
  neurons: HotkeyNeuronRef[];
}): Promise<HotkeyChangeResult[]> => {
  const identity = await getAuthenticatedIdentity();

  const results = await mapPool(
    neurons,
    ({ universeId, neuronId }) =>
      universeId === OWN_CANISTER_ID_TEXT
        ? changeNnsNeuronHotkey({ identity, change, neuronId })
        : changeSnsNeuronHotkey({ identity, change, universeId, neuronId }),
    MAX_PARALLEL_NEURON_CHANGES
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        `Failed to change the hotkey of neuron ${result.item.neuronId}:`,
        result.reason
      );
    }
  }

  await reloadNeurons(neurons.map(({ universeId }) => universeId));

  return results.map(({ item, status }) => ({
    ...item,
    success: status === "fulfilled",
  }));
};
