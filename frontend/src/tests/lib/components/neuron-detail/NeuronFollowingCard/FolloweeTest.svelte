<script lang="ts">
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import type {
    NnsNeuronContext,
    NnsNeuronStore,
  } from "$lib/types/nns-neuron-detail.context";
  import { NNS_NEURON_CONTEXT_KEY } from "$lib/types/nns-neuron-detail.context";
  import { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { mockNeuron } from "$tests/mocks/neurons.mock";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

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
