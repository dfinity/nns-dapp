<script lang="ts">
  import VestingTooltipWrapper from "$lib/components/sns-neuron-detail/VestingTooltipWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { getSnsNeuronStake, isVesting } from "$lib/utils/sns-neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@icp-sdk/canisters/sns";

  type Props = {
    neuron: SnsNeuron;
  };
  const { neuron }: Props = $props();

  const isEmptyNeuron = $derived(getSnsNeuronStake(neuron) === 0n);
  const isVeistingNeuron = $derived(isVesting(neuron));
  const isDisabled = $derived(isVeistingNeuron || isEmptyNeuron);
</script>

{#snippet button()}
  <button
    class="secondary"
    disabled={isDisabled}
    onclick={() => openSnsNeuronModal({ type: "disburse" })}
    data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
  >
{/snippet}

{#if isEmptyNeuron}
  <Tooltip
    id="spawn-maturity-button"
    text={$i18n.neuron_detail.disburse_stake_disabled_tooltip_zero}
  >
    {@render button()}
  </Tooltip>
{:else if isVeistingNeuron}
  <VestingTooltipWrapper {neuron}>
    {@render button()}
  </VestingTooltipWrapper>
{:else}
  {@render button()}
{/if}
