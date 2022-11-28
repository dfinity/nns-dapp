<script lang="ts">
    import {setContext, SvelteComponent} from "svelte";
  import { writable } from "svelte/store";
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import type {
    SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    type SnsNeuronModal,
  } from "$lib/types/sns-neuron-detail.context";
  import { SELECTED_SNS_NEURON_CONTEXT_KEY } from "$lib/types/sns-neuron-detail.context";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Principal } from "@dfinity/principal";

  export let neuron: SnsNeuron | undefined;
  export let rootCanisterId: Principal | null;
  export let testComponent: typeof SvelteComponent;

  export const neuronStore = writable<SelectedSnsNeuronStore>({
    selected: {
      neuronIdHex: getSnsNeuronIdAsHexString(neuron),
      rootCanisterId,
    },
    modal: undefined,
    neuron,
  });

  const toggleModal = (modal: SnsNeuronModal | undefined) =>
    neuronStore.update((data) => ({ ...data, modal }));

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    reload: async () => {
      // Do nothing
    },
    toggleModal,
  });
</script>

<svelte:component this={testComponent} />

<SnsNeuronModals />
