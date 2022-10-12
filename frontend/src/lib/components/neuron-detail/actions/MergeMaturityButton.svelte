<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import MergeMaturityModal from "$lib/modals/neurons/MergeMaturityModal.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import {
    hasEnoughMaturityToMerge,
    minMaturityMerge,
  } from "$lib/utils/neuron.utils";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";

  export let neuron: NeuronInfo;

  let isOpen = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToMerge({
    neuron,
    fee: $mainTransactionFeeStore,
  });
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

{#if isOpen}
  <MergeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}
