<script lang="ts">
  import type { Token } from "@dfinity/utils";
  import type { Universe } from "$lib/types/universe";
  import StakeItemAction from "$lib/components/neuron-detail/StakeItemAction.svelte";

  export let universe: Universe;
  export let token: Token;
  export let neuronStake: 100000000n;
  export let isIncreaseStakeAllowed: boolean | undefined = undefined;

  export let increaseStakeCallback: () => void | undefined = undefined;
</script>

<StakeItemAction
  {universe}
  {token}
  {neuronStake}
  {isIncreaseStakeAllowed}
  on:increaseStake={increaseStakeCallback}
/>
