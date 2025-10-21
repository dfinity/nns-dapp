<script lang="ts">
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import {
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";

  export let neuron: NeuronInfo;
  export let inline = true;

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);

  let spawningTime: bigint | undefined;
  $: spawningTime = getSpawningTimeInSeconds(neuron);
</script>

<NeuronStateRemainingTime
  {inline}
  state={neuron.state}
  timeInSeconds={dissolvingTime ?? spawningTime ?? neuron.dissolveDelaySeconds}
/>
