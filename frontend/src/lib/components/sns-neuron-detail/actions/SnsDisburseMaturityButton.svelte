<script lang="ts">
  import { hasEnoughMaturityToStakeOrDisburse } from "$lib/utils/sns-neuron.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  const context: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
  const { store }: SelectedSnsNeuronContext = context;

  let neuron: SnsNeuron | undefined | null;
  $: ({ neuron } = $store);

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStakeOrDisburse(neuron);

  const showModal = () => openSnsNeuronModal({ type: "disburse-maturity" });
</script>

{#if enoughMaturity}
  <button on:click data-tid="disburse-maturity-button" on:click={showModal}
    >{$i18n.neuron_detail.disburse_maturity}</button
  >
{:else}
  <Tooltip
    id="stake-maturity-tooltip"
    text={$i18n.neuron_detail.disburse_maturity_disabled_tooltip}
  >
    <button disabled data-tid="disburse-maturity-button"
      >{$i18n.neuron_detail.disburse_maturity}</button
    >
  </Tooltip>
{/if}
