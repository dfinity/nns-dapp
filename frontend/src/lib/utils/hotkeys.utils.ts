import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { NeuronsStore as SnsNeuronsStoreData } from "$lib/stores/sns-neurons.store";
import type { Hotkey } from "$lib/types/hotkeys";
import type { Universe } from "$lib/types/universe";
import { getSnsNeuronHotkeys } from "$lib/utils/sns-neuron.utils";
import type { NeuronInfo } from "@icp-sdk/canisters/nns";

/**
 * Groups the hotkeys of the NNS and SNS neurons by principal.
 *
 * - The neurons of a universe that is not in `universes` are ignored.
 * - `excludedPrincipal` is not a hotkey in the result. Use it for the principal of the user.
 * - The hotkeys with the most neurons come first.
 */
export const getHotkeys = ({
  nnsNeurons,
  snsNeurons,
  universes,
  excludedPrincipal,
}: {
  nnsNeurons: NeuronInfo[];
  snsNeurons: SnsNeuronsStoreData;
  universes: Universe[];
  excludedPrincipal: string | undefined;
}): Hotkey[] => {
  // principal -> universe canister id -> neuron count
  const neuronCounts = new Map<string, Map<string, number>>();

  const addHotkeys = ({
    universeId,
    hotkeys,
  }: {
    universeId: string;
    hotkeys: string[];
  }) => {
    for (const principal of hotkeys) {
      if (principal === excludedPrincipal) {
        continue;
      }
      const countsByUniverse =
        neuronCounts.get(principal) ?? new Map<string, number>();
      countsByUniverse.set(
        universeId,
        (countsByUniverse.get(universeId) ?? 0) + 1
      );
      neuronCounts.set(principal, countsByUniverse);
    }
  };

  for (const { canisterId } of universes) {
    if (canisterId === OWN_CANISTER_ID_TEXT) {
      for (const { fullNeuron } of nnsNeurons) {
        addHotkeys({
          universeId: canisterId,
          hotkeys: fullNeuron?.hotKeys ?? [],
        });
      }
      continue;
    }
    for (const neuron of snsNeurons[canisterId]?.neurons ?? []) {
      addHotkeys({
        universeId: canisterId,
        hotkeys: getSnsNeuronHotkeys(neuron),
      });
    }
  }

  const hotkeys: Hotkey[] = [];
  for (const [principal, countsByUniverse] of neuronCounts) {
    const projects = universes
      .filter(({ canisterId }) => countsByUniverse.has(canisterId))
      .map((universe) => ({
        universe,
        neuronCount: countsByUniverse.get(universe.canisterId) ?? 0,
      }));
    hotkeys.push({
      principal,
      neuronCount: projects.reduce(
        (sum, { neuronCount }) => sum + neuronCount,
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
