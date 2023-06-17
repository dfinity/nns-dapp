<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import type {
    SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
  } from "$lib/types/sns-neuron-detail.context";
  import { SELECTED_SNS_NEURON_CONTEXT_KEY } from "$lib/types/sns-neuron-detail.context";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import DissolveSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/DissolveSnsNeuronButton.svelte";
  import { NeuronState } from "@dfinity/nns";

  export let neuron: SnsNeuron | undefined;
  export let neuronState: NeuronState;
  export let spy: (() => void) | undefined = undefined;

  export const neuronStore = writable<SelectedSnsNeuronStore>({
    selected: {
      neuronIdHex: getSnsNeuronIdAsHexString(neuron),
      rootCanisterId: null,
    },
    modal: undefined,
    neuron,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    reload: async () => spy?.(),
  });
</script>

<DissolveSnsNeuronButton {neuronState} />

<SnsNeuronModals />
