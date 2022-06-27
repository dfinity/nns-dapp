<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import SplitNeuronModal from "../../../modals/neurons/SplitNeuronModal.svelte";
  import {
    minNeuronSplittable,
    neuronCanBeSplit,
  } from "../../../utils/neuron.utils";
  import { i18n } from "../../../stores/i18n";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatICP } from "../../../utils/icp.utils";
  import Tooltip from "../../ui/Tooltip.svelte";
  import { mainTransactionFeeStore } from "../../../stores/transaction-fees.store";

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
  <button on:click={openModal} class="primary small"
    >{$i18n.neuron_detail.split_neuron}</button
  >
{:else}
  <Tooltip
    id="split-neuron-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatICP({
          value: BigInt(minNeuronSplittable($mainTransactionFeeStore)),
          detailed: true,
        }),
      }
    )}
  >
    <button on:click={openModal} class="primary small" disabled
      >{$i18n.neuron_detail.split_neuron}</button
    >
  </Tooltip>
{/if}

{#if isOpen}
  <SplitNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}
