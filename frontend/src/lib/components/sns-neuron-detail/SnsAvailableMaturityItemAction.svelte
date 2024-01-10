<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    formattedMaturity,
    hasPermissionToDisburseMaturity,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import SnsStakeMaturityButton from "./actions/SnsStakeMaturityButton.svelte";
  import SnsDisburseMaturityButton from "./actions/SnsDisburseMaturityButton.svelte";
  import { authStore } from "$lib/stores/auth.store";

  export let neuron: SnsNeuron;
  export let feeE8s: bigint;

  let allowedToStakeMaturity: boolean;
  $: allowedToStakeMaturity = hasPermissionToStakeMaturity({
    neuron,
    identity: $authStore.identity,
  });
  let allowedToDisburseMaturity: boolean;
  $: allowedToDisburseMaturity = hasPermissionToDisburseMaturity({
    neuron,
    identity: $authStore.identity,
  });
</script>

<CommonItemAction testId="sns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <span slot="title" data-tid="available-maturity"
    >{formattedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}</svelte:fragment
  >
  {#if allowedToStakeMaturity}
    <SnsStakeMaturityButton {neuron} />
  {/if}

  {#if allowedToDisburseMaturity}
    <SnsDisburseMaturityButton {neuron} {feeE8s} />
  {/if}
</CommonItemAction>
