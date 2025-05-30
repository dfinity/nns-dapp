<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import {
    MATURITY_MODULATION_VARIANCE_PERCENTAGE,
    MIN_NEURON_STAKE,
    MINIMUM_DISBURSEMENT,
    ULPS_PER_MATURITY,
  } from "$lib/constants/neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { isEnoughMaturityToDisburse } from "$lib/utils/neuron.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
  };

  const { neuron }: Props = $props();

  const enoughMaturity = $derived(
    nonNullish(neuron.fullNeuron) &&
      // Same logic as in SpawnNeuronButton
      isEnoughMaturityToDisburse({
        neuron,
        percentage: 100,
      })
  );

  const showModal = () =>
    openNnsNeuronModal({
      type: "disburse-maturity",
      data: { neuron },
    });
</script>

<TestIdWrapper testId="disburse-maturity-button-component">
  {#if enoughMaturity}
    <button
      data-tid="disburse-maturity-button"
      class="secondary"
      onclick={showModal}
    >
      {$i18n.neuron_detail.disburse_maturity}
    </button>
  {:else}
    <Tooltip
      id="disburse-maturity-button"
      text={replacePlaceholders(
        $i18n.neuron_detail.disburse_maturity_disabled_tooltip,
        {
          $amount: formatNumber(
            Number(MIN_NEURON_STAKE) /
              ULPS_PER_MATURITY /
              MATURITY_MODULATION_VARIANCE_PERCENTAGE,
            { minFraction: 4, maxFraction: 4 }
          ),
          $min: formatNumber(Number(MINIMUM_DISBURSEMENT) / ULPS_PER_MATURITY, {
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
      <button data-tid="disburse-maturity-button" disabled class="secondary">
        {$i18n.neuron_detail.disburse_maturity}
      </button>
    </Tooltip>
  {/if}
</TestIdWrapper>
