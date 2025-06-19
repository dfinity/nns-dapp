<script lang="ts">
  import { page } from "$app/state";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { projectSlugMapStore } from "$lib/derived/analytics.derived";
  import { analytics } from "$lib/services/analytics.services";
  import { i18n } from "$lib/stores/i18n";
  import { transformUrlForAnalytics } from "$lib/utils/analytics.utils";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    formatMaturity,
    totalMaturityDisbursementsInProgress,
  } from "$lib/utils/neuron.utils";
  import { IconPace } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  type Props = {
    neuron: NeuronInfo;
  };
  const { neuron }: Props = $props();
  const totalMaturityDisbursements = $derived(
    totalMaturityDisbursementsInProgress(neuron)
  );
  const showModal = () => {
    openNnsNeuronModal({
      type: "view-active-disbursements",
      data: { neuron },
    });

    const activeDisbursementsCount = (
      neuron.fullNeuron?.maturityDisbursementsInProgress ?? []
    ).length;

    analytics.event(
      "nns-disburse-maturity-show-active",
      transformUrlForAnalytics(page.url, $projectSlugMapStore),
      {
        activeDisbursementsCount,
      }
    );
  };
</script>

{#if totalMaturityDisbursements > 0n}
  <CommonItemAction testId="view-active-disbursements-item-action-component">
    <IconPace slot="icon" />
    <span slot="title" data-tid="disbursement-total"
      >{formatMaturity(totalMaturityDisbursements)}</span
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.neuron_detail.view_active_disbursements_status}</svelte:fragment
    >

    <button class="secondary" onclick={showModal}
      >{$i18n.neuron_detail.view_active_disbursements}</button
    >
  </CommonItemAction>
{/if}
