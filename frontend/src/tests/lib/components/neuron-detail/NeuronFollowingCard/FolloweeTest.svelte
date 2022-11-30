<script lang="ts">
  import { writable } from "svelte/store";
  import type { NnsNeuronStore } from "$lib/types/nns-neuron-detail.context";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { mockNeuron } from "../../../../mocks/neurons.mock";

  export let followee: FolloweesNeuron;

  export const neuronStore = writable<NnsNeuronStore>({
    neuron: mockNeuron,
  });
</script>

<Followee {followee} />

<NnsNeuronModals />
