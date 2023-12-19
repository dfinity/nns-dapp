<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    minNeuronSplittable,
    neuronCanBeSplit,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { ICPToken } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let splittable: boolean;
  $: splittable = neuronCanBeSplit({
    neuron,
    fee: $mainTransactionFeeStore,
  });

  const openModal = () =>
    openNnsNeuronModal({ type: "split-neuron", data: { neuron } });

  const testId = "split-nns-neuron-button-component";
</script>

{#if splittable}
  <button on:click={openModal} class="secondary" data-tid={testId}
    >{$i18n.neuron_detail.split_neuron}</button
  >
{:else}
  <Tooltip
    id="split-neuron-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatTokenE8s({
          value: BigInt(minNeuronSplittable($mainTransactionFeeStore)),
          detailed: true,
        }),
        $token: ICPToken.symbol,
      }
    )}
  >
    <button on:click={openModal} class="secondary" disabled data-tid={testId}
      >{$i18n.neuron_detail.split_neuron}</button
    >
  </Tooltip>
{/if}
