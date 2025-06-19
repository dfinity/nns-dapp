<script lang="ts">
  import { page } from "$app/state";
  import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
  import {
    MAX_DISBURSEMENTS_IN_PROGRESS,
    MIN_DISBURSEMENT_WITH_VARIANCE_ICP,
  } from "$lib/constants/neurons.constants";
  import { projectSlugMapStore } from "$lib/derived/analytics.derived";
  import { analytics } from "$lib/services/analytics.services";
  import { i18n } from "$lib/stores/i18n";
  import { transformUrlForAnalytics } from "$lib/utils/analytics.utils";
  import { formatNumber } from "$lib/utils/format.utils";
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

    analytics.event(
      "nns-disburse-maturity-start",
      transformUrlForAnalytics(page.url, $projectSlugMapStore)
    );
  };
</script>

<DisburseMaturityButton on:click={showModal} {disabledText} />
