<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import {
    MATURITY_MODULATION_VARIANCE_PERCENTAGE,
    MIN_NEURON_STAKE,
  } from "$lib/constants/neurons.constants";
  import { ULPS_PER_MATURITY } from "$lib/constants/neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { isEnoughMaturityToSpawn } from "$lib/utils/neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  let enoughMaturity: boolean;
  $: enoughMaturity =
    neuron.fullNeuron === undefined
      ? false
      : isEnoughMaturityToSpawn({
          neuron,
          percentage: 100,
        });

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  const showModal = () =>
    openNnsNeuronModal({ type: "spawn", data: { neuron: $store.neuron } });
</script>

<TestIdWrapper testId="spawn-neuron-button-component">
  {#if enoughMaturity}
    <button
      data-tid="spawn-neuron-button"
      class="secondary"
      on:click={showModal}
    >
      {$i18n.neuron_detail.spawn_neuron}
    </button>
  {:else}
    <Tooltip
      id="spawn-maturity-button"
      text={replacePlaceholders(
        $i18n.neuron_detail.spawn_neuron_disabled_tooltip,
        {
          $amount: formatNumber(
            Number(MIN_NEURON_STAKE) /
              ULPS_PER_MATURITY /
              MATURITY_MODULATION_VARIANCE_PERCENTAGE,
            { minFraction: 4, maxFraction: 4 }
          ),
          $min: formatNumber(Number(MIN_NEURON_STAKE) / ULPS_PER_MATURITY, {
            minFraction: 0,
            maxFraction: 0,
          }),
          $variability: formatPercentage(
            MATURITY_MODULATION_VARIANCE_PERCENTAGE,
            {
              minFraction: 0,
              maxFraction: 0,
            }
          ),
        }
      )}
    >
      <button data-tid="spawn-neuron-button" disabled class="secondary">
        {$i18n.neuron_detail.spawn_neuron}
      </button>
    </Tooltip>
  {/if}
</TestIdWrapper>
