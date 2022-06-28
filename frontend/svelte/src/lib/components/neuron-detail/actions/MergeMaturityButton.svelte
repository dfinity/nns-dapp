<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import MergeMaturityModal from "../../../modals/neurons/MergeMaturityModal.svelte";
  import Tooltip from "../../ui/Tooltip.svelte";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatICP } from "../../../utils/icp.utils";
  import {
    hasEnoughMaturityToMerge,
    minMaturityMerge,
  } from "../../../utils/neuron.utils";
  import { mainTransactionFeeStore } from "../../../stores/transaction-fees.store";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  const enoughMaturity = hasEnoughMaturityToMerge({
    neuron,
    fee: $mainTransactionFeeStore,
  });
</script>

{#if enoughMaturity}
  <button class="primary small" on:click={showModal}
    >{$i18n.neuron_detail.merge_maturity}</button
  >
{:else}
  <Tooltip
    id="merge-maturity-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.merge_maturity_disabled_tooltip,
      {
        $amount: formatICP({
          value: BigInt(minMaturityMerge($mainTransactionFeeStore)),
          detailed: true,
        }),
      }
    )}
  >
    <button disabled class="primary small" on:click={showModal}
      >{$i18n.neuron_detail.merge_maturity}</button
    >
  </Tooltip>
{/if}

{#if isOpen}
  <MergeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}
