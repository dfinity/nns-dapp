<script lang="ts">
  import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    hasEnoughStakeToSplit,
    isVesting,
    minNeuronSplittable,
  } from "$lib/utils/sns-neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    fromDefinedNullable,
    type Token,
    type TokenAmountV2,
  } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let transactionFee: TokenAmountV2;
  export let token: Token;

  let neuronMinimumStakeE8s: bigint;
  $: neuronMinimumStakeE8s = fromDefinedNullable(
    parameters.neuron_minimum_stake_e8s
  );

  let enoughStakeToSplit: boolean;
  $: enoughStakeToSplit = hasEnoughStakeToSplit({
    neuron,
    fee: transactionFee.toE8s(),
    neuronMinimumStake: neuronMinimumStakeE8s,
  });
</script>

{#if enoughStakeToSplit}
  <VestingTooltipWrapper {neuron}>
    <button
      class="secondary"
      disabled={isVesting(neuron)}
      on:click={() => openSnsNeuronModal({ type: "split-neuron" })}
      data-tid="split-neuron-button">{$i18n.neuron_detail.split_neuron}</button
    >
  </VestingTooltipWrapper>
{:else}
  <Tooltip
    id="split-neuron-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatTokenE8s({
          value: minNeuronSplittable({
            fee: transactionFee.toE8s(),
            neuronMinimumStake: neuronMinimumStakeE8s,
          }),
          detailed: true,
        }),
        $token: token.symbol,
      }
    )}
  >
    <button class="secondary" data-tid="split-neuron-button" disabled
      >{$i18n.neuron_detail.split_neuron}</button
    >
  </Tooltip>
{/if}
