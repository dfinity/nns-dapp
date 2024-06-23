<script lang="ts">
  import SnsViewActiveDisbursementsButton from "$lib/components/sns-neuron-detail/actions/SnsViewActiveDisbursementsButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { totalDisbursingMaturity } from "$lib/utils/sns-neuron.utils";
  import { IconPace } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;

  let disbursingMaturity: bigint;
  $: disbursingMaturity = totalDisbursingMaturity(neuron);
</script>

{#if disbursingMaturity > 0n}
  <CommonItemAction
    testId="sns-view-active-disbursements-item-action-component"
  >
    <IconPace slot="icon" />
    <span slot="title" data-tid="disbursement-total"
      >{formatMaturity(disbursingMaturity)}</span
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.neuron_detail.view_active_disbursements_status}</svelte:fragment
    >

    <SnsViewActiveDisbursementsButton />
  </CommonItemAction>
{/if}
