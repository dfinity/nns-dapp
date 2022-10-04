<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import SplitNeuronModal from "$lib/modals/neurons/SplitNeuronModal.svelte";
  import {
    minNeuronSplittable,
    neuronCanBeSplit,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/icp.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;

  const openModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let splittable: boolean;
  $: splittable = neuronCanBeSplit({
    neuron,
    fee: $mainTransactionFeeStore,
  });
</script>

{#if splittable}
  <button on:click={openModal} class="primary"
    >{$i18n.neuron_detail.split_neuron}</button
  >
{:else}
  <Tooltip
    id="split-neuron-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatToken({
          value: BigInt(minNeuronSplittable($mainTransactionFeeStore)),
          detailed: true,
        }),
      }
    )}
  >
    <button on:click={openModal} class="primary" disabled
      >{$i18n.neuron_detail.split_neuron}</button
    >
  </Tooltip>
{/if}

{#if isOpen}
  <SplitNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}
