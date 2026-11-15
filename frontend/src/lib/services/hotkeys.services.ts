import {
  clearCache as clearGovernanceApiCache,
  governanceApiService,
} from "$lib/api-services/governance.api-service";
import { queryNeurons } from "$lib/api/governance.api";
import {
  addNeuronPermissions,
  querySnsNeurons,
  removeNeuronPermissions,
} from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
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
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
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
  neuron,
}: {
  identity: Identity;
  change: HotkeyChange;
  neuron: NeuronInfo;
}) => {
  const hotKeys = neuron.fullNeuron?.hotKeys;
  if (isNullish(hotKeys)) {
    throw new Error(`NNS neuron ${neuron.neuronId} has no full neuron`);
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
  neuron,
}: {
  identity: Identity;
  change: HotkeyChange;
  universeId: string;
  neuron: SnsGovernanceDid.Neuron;
}) => {
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

type LoadedNeurons =
  | { universeId: string; nnsNeurons: NeuronInfo[] }
  | { universeId: string; snsNeurons: SnsGovernanceDid.Neuron[] };

const loadCertifiedNeurons = async ({
  identity,
  universeId,
}: {
  identity: Identity;
  universeId: string;
}): Promise<LoadedNeurons> =>
  universeId === OWN_CANISTER_ID_TEXT
    ? {
        universeId,
        // Not `governanceApiService.queryNeurons`: it returns cached neurons, and a change needs the current state.
        nnsNeurons: await queryNeurons({
          identity,
          certified: true,
          includeEmptyNeurons: false,
        }),
      }
    : {
        universeId,
        snsNeurons: await querySnsNeurons({
          identity,
          rootCanisterId: Principal.fromText(universeId),
          certified: true,
        }),
      };

/**
 * Replaces or removes a hotkey on the given neurons.
 *
 * It loads the certified neurons first, and each neuron changes from that
 * state. A second run on a neuron that failed half way only does the missing
 * steps. If the neurons of a universe do not load, its neurons fail.
 *
 * The caller loads the neurons into the stores again. A change without a call
 * still clears the cached NNS neurons, so that load gets the current state.
 */
export const changeHotkeyOnNeurons = async ({
  change,
  neurons,
}: {
  change: HotkeyChange;
  neurons: HotkeyNeuronRef[];
}): Promise<HotkeyChangeResult[]> => {
  const identity = await getAuthenticatedIdentity();

  const loads = await mapPool(
    [...new Set(neurons.map(({ universeId }) => universeId))],
    (universeId) => loadCertifiedNeurons({ identity, universeId }),
    MAX_PARALLEL_NEURON_CHANGES
  );
  const nnsNeurons = new Map<string, NeuronInfo>();
  const snsNeurons = new Map<string, SnsGovernanceDid.Neuron>();
  for (const load of loads) {
    if (load.status === "rejected") {
      console.error(
        `Failed to load the neurons of universe ${load.item}:`,
        load.reason
      );
      continue;
    }
    const { value } = load;
    if ("nnsNeurons" in value) {
      for (const neuron of value.nnsNeurons) {
        nnsNeurons.set(neuron.neuronId.toString(), neuron);
      }
    } else {
      for (const neuron of value.snsNeurons) {
        snsNeurons.set(
          `${value.universeId}:${getSnsNeuronIdAsHexString(neuron)}`,
          neuron
        );
      }
    }
  }

  const results = await mapPool(
    neurons,
    async ({ universeId, neuronId }) => {
      if (universeId === OWN_CANISTER_ID_TEXT) {
        const neuron = nnsNeurons.get(neuronId);
        if (isNullish(neuron)) {
          throw new Error(`NNS neuron ${neuronId} not found`);
        }
        return changeNnsNeuronHotkey({ identity, change, neuron });
      }
      const neuron = snsNeurons.get(`${universeId}:${neuronId}`);
      if (isNullish(neuron)) {
        throw new Error(`SNS neuron ${neuronId} not found`);
      }
      return changeSnsNeuronHotkey({ identity, change, universeId, neuron });
    },
    MAX_PARALLEL_NEURON_CHANGES
  );

  if (neurons.some(({ universeId }) => universeId === OWN_CANISTER_ID_TEXT)) {
    clearGovernanceApiCache();
  }

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        `Failed to change the hotkey of neuron ${result.item.neuronId}:`,
        result.reason
      );
    }
  }

  return results.map(({ item, status }) => ({
    ...item,
    success: status === "fulfilled",
  }));
};
