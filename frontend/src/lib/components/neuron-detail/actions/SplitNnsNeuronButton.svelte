<script lang="ts">
  import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    minNeuronSplittable,
    neuronCanBeSplit,
  } from "$lib/utils/neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let splittable: boolean;
  $: splittable = neuronCanBeSplit({
    neuron,
    fee: $mainTransactionFeeE8sStore,
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
          value: BigInt(minNeuronSplittable($mainTransactionFeeE8sStore)),
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
