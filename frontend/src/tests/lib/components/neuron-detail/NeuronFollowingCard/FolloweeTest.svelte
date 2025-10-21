<script lang="ts">
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import NnsNeuronModals from "$lib/modals/neurons/NnsNeuronModals.svelte";
  import type { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";

  export let followee: FolloweesNeuron;
  export let neuron: NeuronInfo;
  export let isInteractive: boolean;
</script>

<Followee {followee} {neuron} {isInteractive} />

<NnsNeuronModals />
