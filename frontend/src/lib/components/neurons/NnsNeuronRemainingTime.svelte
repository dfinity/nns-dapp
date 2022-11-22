<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
  } from "$lib/utils/neuron.utils";
  import NeuronStateRemainingTime from "./NeuronStateRemainingTime.svelte";

  export let neuron: NeuronInfo;
  export let inline = true;

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);

  let spawningTime: bigint | undefined;
  $: spawningTime = getSpawningTimeInSeconds(neuron);
</script>

<NeuronStateRemainingTime {inline}
  state={neuron.state}
  timeInSeconds={dissolvingTime ?? spawningTime ?? neuron.dissolveDelaySeconds}
/>
