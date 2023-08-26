<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconPace } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import SnsViewActiveDisbursementsButton from "$lib/components/sns-neuron-detail/actions/SnsViewActiveDisbursementsButton.svelte";

  export let neuron: SnsNeuron;

  let disbursementsInProgress: number;
  $: disbursementsInProgress =
    neuron?.disburse_maturity_in_progress.length ?? 0;
</script>

{#if disbursementsInProgress > 0}
  <CommonItemAction testId="sns-available-maturity-item-action-component">
    <IconPace slot="icon" />
    <span slot="title" data-tid="available-maturity"
      >{disbursementsInProgress}</span
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.neuron_detail.view_active_disbursements_status}</svelte:fragment
    >

    <SnsViewActiveDisbursementsButton />
  </CommonItemAction>
{/if}
