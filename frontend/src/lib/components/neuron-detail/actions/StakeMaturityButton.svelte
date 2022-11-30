<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { hasEnoughMaturityToStake } from "$lib/utils/neuron.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import {openNnsNeuronModal} from "$lib/utils/modals.utils";

  export let neuron: NeuronInfo;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStake(neuron);

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
          NNS_NEURON_CONTEXT_KEY
  );

  const showModal = () => openNnsNeuronModal({type: "stake-maturity", data: {neuron: $store.neuron}})
</script>

{#if enoughMaturity}
  <button class="primary" on:click={showModal} data-tid="stake-maturity-button"
    >{$i18n.neuron_detail.stake_maturity}</button
  >
{:else}
  <Tooltip
    id="stake-maturity-tooltip"
    text={$i18n.neuron_detail.stake_maturity_disabled_tooltip}
  >
    <button
      disabled
      class="primary"
      on:click={showModal}
      data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}
