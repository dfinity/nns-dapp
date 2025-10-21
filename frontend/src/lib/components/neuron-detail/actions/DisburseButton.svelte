<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";

  type Props = {
    neuron: NeuronInfo;
  };
  const { neuron }: Props = $props();
  const isDisabled = $derived(neuronStake(neuron) === 0n);
</script>

{#snippet button()}
  <button
    class="secondary"
    disabled={isDisabled}
    onclick={() => openNnsNeuronModal({ type: "disburse", data: { neuron } })}
    data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
  >
{/snippet}

{#if isDisabled}
  <Tooltip
    id="spawn-maturity-button"
    text={$i18n.neuron_detail.disburse_stake_disabled_tooltip_zero}
  >
    {@render button()}
  </Tooltip>
{:else}
  {@render button()}
{/if}
