import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { SnsParametersStore } from "$lib/derived/sns-parameters.derived";
import type { NeuronsStore as SnsNeuronsStoreData } from "$lib/stores/sns-neurons.store";
import type { Hotkey, HotkeyNeuron } from "$lib/types/hotkeys";
import type { Universe } from "$lib/types/universe";
import {
  canIdentityManageHotkeys,
  getSnsNeuronHotkeys,
  getSnsNeuronIdAsHexString,
} from "$lib/utils/sns-neuron.utils";
import { fromNullable, isNullish } from "@dfinity/utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import type { Identity } from "@icp-sdk/core/agent";

const canChangeSnsNeuronHotkeys = ({
  neuron,
  identity,
  parameters,
}: {
  neuron: SnsGovernanceDid.Neuron;
  identity: Identity | undefined | null;
  parameters: SnsGovernanceDid.NervousSystemParameters | undefined;
}): boolean =>
  !isNullish(parameters) &&
  !isNullish(fromNullable(parameters.neuron_grantable_permissions)) &&
  canIdentityManageHotkeys({ neuron, identity, parameters });

/**
 * Groups the hotkeys of the NNS and SNS neurons by principal.
 *
 * - The neurons of a universe that is not in `universes` are ignored.
 * - The principal of `identity` is not a hotkey in the result.
 * - The user can change an NNS neuron that their principal controls, and an SNS neuron
 *   on which their principal can manage hotkeys.
 * - The hotkeys with the most neurons come first.
 */
export const getHotkeys = ({
  nnsNeurons,
  snsNeurons,
  snsParameters,
  universes,
  identity,
}: {
  nnsNeurons: NeuronInfo[];
  snsNeurons: SnsNeuronsStoreData;
  snsParameters: SnsParametersStore;
  universes: Universe[];
  identity: Identity | undefined | null;
}): Hotkey[] => {
  const userPrincipal = identity?.getPrincipal().toText();
  // principal -> universe canister id -> neurons
  const hotkeyNeurons = new Map<string, Map<string, HotkeyNeuron[]>>();

  const addHotkeys = ({
    universeId,
    hotkeys,
    neuron,
  }: {
    universeId: string;
    hotkeys: string[];
    neuron: HotkeyNeuron;
  }) => {
    for (const principal of hotkeys) {
      if (principal === userPrincipal) {
        continue;
      }
      let neuronsByUniverse = hotkeyNeurons.get(principal);
      if (isNullish(neuronsByUniverse)) {
        neuronsByUniverse = new Map<string, HotkeyNeuron[]>();
        hotkeyNeurons.set(principal, neuronsByUniverse);
      }
      let neurons = neuronsByUniverse.get(universeId);
      if (isNullish(neurons)) {
        neurons = [];
        neuronsByUniverse.set(universeId, neurons);
      }
      neurons.push(neuron);
    }
  };

  for (const { canisterId } of universes) {
    if (canisterId === OWN_CANISTER_ID_TEXT) {
      for (const { neuronId, fullNeuron } of nnsNeurons) {
        addHotkeys({
          universeId: canisterId,
          hotkeys: fullNeuron?.hotKeys ?? [],
          neuron: {
            neuronId: neuronId.toString(),
            canChange:
              !isNullish(userPrincipal) &&
              fullNeuron?.controller === userPrincipal,
          },
        });
      }
      continue;
    }
    for (const neuron of snsNeurons[canisterId]?.neurons ?? []) {
      addHotkeys({
        universeId: canisterId,
        hotkeys: getSnsNeuronHotkeys(neuron),
        neuron: {
          neuronId: getSnsNeuronIdAsHexString(neuron),
          canChange: canChangeSnsNeuronHotkeys({
            neuron,
            identity,
            parameters: snsParameters[canisterId]?.parameters,
          }),
        },
      });
    }
  }

  const hotkeys: Hotkey[] = [];
  for (const [principal, neuronsByUniverse] of hotkeyNeurons) {
    const projects = universes
      .filter(({ canisterId }) => neuronsByUniverse.has(canisterId))
      .map((universe) => ({
        universe,
        neurons: neuronsByUniverse.get(universe.canisterId) ?? [],
      }));
    hotkeys.push({
      principal,
      neuronCount: projects.reduce(
        (sum, { neurons }) => sum + neurons.length,
        0
      ),
      projects,
    });
  }

  return hotkeys.sort(
    (a, b) =>
      b.neuronCount - a.neuronCount || a.principal.localeCompare(b.principal)
  );
};
