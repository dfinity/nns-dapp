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
  import { mainTransactionFeeNumberStore } from "../../../stores/transaction-fees.store";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;

  const openModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let isSplittable: boolean;
  $: isSplittable = neuronCanBeSplit({
    neuron,
    fee: $mainTransactionFeeNumberStore,
  });
</script>

<Tooltip
  id="split-neuron-button"
  text={replacePlaceholders($i18n.neuron_detail.split_neuron_disabled_tooltip, {
    $amount: formatICP({
      value: BigInt(minNeuronSplittable($mainTransactionFeeNumberStore)),
      detailed: true,
    }),
  })}
>
  <button on:click={openModal} class="primary small" disabled={!isSplittable}
    >{$i18n.neuron_detail.split_neuron}</button
  >
</Tooltip>

{#if isOpen}
  <SplitNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}
