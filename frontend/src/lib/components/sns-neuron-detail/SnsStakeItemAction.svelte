<script lang="ts">
  import StakeItemAction from "$lib/components/neuron-detail/StakeItemAction.svelte";
  import type { Universe } from "$lib/types/universe";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    getSnsNeuronStake,
    isCommunityFund,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let universe: Universe;

  let isIncreaseStakeAllowed = false;
  $: isIncreaseStakeAllowed = !isCommunityFund(neuron);
</script>

<StakeItemAction
  {universe}
  {token}
  neuronStake={getSnsNeuronStake(neuron)}
  {isIncreaseStakeAllowed}
  on:increaseStake={() =>
    openSnsNeuronModal({
      type: "increase-stake",
    })}
/>
