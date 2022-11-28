<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import {
    NNS_NEURON_CONTEXT_KEY,
    NnsNeuronModal,
  } from "$lib/types/nns-neuron-detail.context";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { mockNeuron } from "../../../../mocks/neurons.mock";

  export let followee: FolloweesNeuron;

  export const neuronStore = writable<NnsNeuronStore>({
    modal: undefined,
    neuron: mockNeuron,
    selectedFollowee: followee,
  });

  const toggleModal = (modal: NnsNeuronModal) =>
    neuronStore.update((data) => ({ ...data, modal }));

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    toggleModal,
  });
</script>

<Followee {followee} />

<NnsNeuronModals />
