<script lang="ts">
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import {
    getSnsDissolvingTimeInSeconds,
    getSnsLockedTimeInSeconds,
    getSnsNeuronState,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;
  export let inline = true;

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getSnsDissolvingTimeInSeconds(neuron);

  let lockedTime: bigint | undefined;
  $: lockedTime = getSnsLockedTimeInSeconds(neuron);
</script>

<NeuronStateRemainingTime
  {inline}
  state={getSnsNeuronState(neuron)}
  timeInSeconds={dissolvingTime ?? lockedTime}
/>
