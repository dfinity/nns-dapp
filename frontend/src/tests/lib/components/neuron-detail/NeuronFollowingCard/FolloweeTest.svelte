<script lang="ts">
  import { writable } from "svelte/store";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { mockNeuron } from "../../../../mocks/neurons.mock";
  import { setContext } from "svelte";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";

  export let followee: FolloweesNeuron;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron: mockNeuron,
  });

  setContext<NnsNeuronContext>(NNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
  });
</script>

<Followee {followee} />

<NnsNeuronModals />
