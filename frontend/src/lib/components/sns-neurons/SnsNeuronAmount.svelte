<script lang="ts">
  import { TokenAmount } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { getSnsNeuronStake } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { Spinner } from "@dfinity/gix-components";

  export let neuron: SnsNeuron;

  let neuronStake: TokenAmount | undefined;
  $: neuronStake =
    $snsTokenSymbolSelectedStore !== undefined
      ? TokenAmount.fromE8s({
          amount: getSnsNeuronStake(neuron),
          // If we got here is because the token symbol is present.
          // The projects without token are discarded filtered out.
          token: $snsTokenSymbolSelectedStore,
        })
      : undefined;
</script>

<div>
  {#if neuronStake !== undefined}
    <AmountDisplay amount={neuronStake} title />
  {:else}
    <Spinner inline size="small" />
  {/if}
</div>
