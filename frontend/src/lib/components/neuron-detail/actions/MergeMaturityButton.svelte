<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import {
    hasEnoughMaturityToMerge,
    minMaturityMerge,
  } from "$lib/utils/neuron.utils";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToMerge({
    neuron,
    fee: $mainTransactionFeeStore,
  });

  const { toggleModal }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  const showModal = () => toggleModal("merge-maturity");
</script>

{#if enoughMaturity}
  <button class="primary" on:click={showModal} data-tid="merge-maturity-button"
    >{$i18n.neuron_detail.merge_maturity}</button
  >
{:else}
  <Tooltip
    id="merge-maturity-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.merge_maturity_disabled_tooltip,
      {
        $amount: formatToken({
          value: BigInt(minMaturityMerge($mainTransactionFeeStore)),
          detailed: true,
        }),
      }
    )}
  >
    <button
      disabled
      class="primary"
      on:click={showModal}
      data-tid="merge-maturity-button"
      >{$i18n.neuron_detail.merge_maturity}</button
    >
  </Tooltip>
{/if}
