<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { isSpawning, neuronStake } from "$lib/utils/neuron.utils";
  import { IconStackedLineChart } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

  export let neuron: NeuronInfo;
  export let proposerNeuron = false;

  let neuronICP: TokenAmountV2;
  $: neuronICP = TokenAmountV2.fromUlps({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

{#if isSpawning(neuron)}
  <IconStackedLineChart />
{:else if proposerNeuron}
  <AmountDisplay
    title
    label={$i18n.neurons.voting_power}
    amount={TokenAmountV2.fromUlps({
      amount: neuron.decidingVotingPower ?? 0n,
      token: ICPToken,
    })}
    detailed
  />
{:else if neuronICP}
  <AmountDisplay title amount={neuronICP} detailed />
{/if}
