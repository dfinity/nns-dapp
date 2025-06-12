<script lang="ts">
  import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
  import {
    MATURITY_MODULATION_VARIANCE_PERCENTAGE,
    MAX_DISBURSEMENTS_IN_PROGRESS,
    MIN_DISBURSEMENT_WITH_VARIANCE_ICP,
    MINIMUM_DISBURSEMENT,
    ULPS_PER_MATURITY,
  } from "$lib/constants/neurons.constants";
  import { analytics } from "$lib/services/analytics.services";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { isEnoughMaturityToDisburse } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
  };

  const { neuron }: Props = $props();
  const enoughMaturity = $derived(
    nonNullish(neuron.fullNeuron) &&
      isEnoughMaturityToDisburse({
        neuron,
        percentage: 100,
      })
  );
  const isMaximumDisbursementsReached = $derived.by(() => {
    const activeDisbursements =
      neuron.fullNeuron?.maturityDisbursementsInProgress ?? [];
    return activeDisbursements.length >= MAX_DISBURSEMENTS_IN_PROGRESS;
  });
  const getNotEnoughMaturityDisabledText = () =>
    replacePlaceholders(
      $i18n.neuron_detail.disburse_maturity_disabled_tooltip,
      {
        $amount: formatNumber(MIN_DISBURSEMENT_WITH_VARIANCE_ICP, {
          minFraction: 4,
          maxFraction: 4,
        }),
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
    );
  const getMaximumReachedDisabledText = () =>
    replacePlaceholders(
      $i18n.neuron_detail.stake_maturity_disabled_tooltip_max_disbursements,
      {
        $maxDisbursements: `${MAX_DISBURSEMENTS_IN_PROGRESS}`,
      }
    );
  const disabledText = $derived(
    !enoughMaturity
      ? getNotEnoughMaturityDisabledText()
      : isMaximumDisbursementsReached
        ? getMaximumReachedDisabledText()
        : undefined
  );
  const showModal = () => {
    openNnsNeuronModal({
      type: "disburse-maturity",
      data: { neuron },
    });

    analytics.event("nns-disburse-maturity-start");
  };
</script>

<DisburseMaturityButton on:click={showModal} {disabledText} />
