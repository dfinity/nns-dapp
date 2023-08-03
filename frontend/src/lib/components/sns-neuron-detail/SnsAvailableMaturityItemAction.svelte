<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    formattedMaturity,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import SnsStakeMaturityButton from "./actions/SnsStakeMaturityButton.svelte";
  import { authStore } from "$lib/stores/auth.store";

  export let neuron: SnsNeuron;

  let allowedToStakeMaturity: boolean;
  $: allowedToStakeMaturity = hasPermissionToStakeMaturity({
    neuron,
    identity: $authStore.identity,
  });
</script>

<CommonItemAction testId="sns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <svelte:fragment slot="title">{formattedMaturity(neuron)}</svelte:fragment>
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}</svelte:fragment
  >
  {#if allowedToStakeMaturity}
    <SnsStakeMaturityButton variant="secondary" />
  {/if}
</CommonItemAction>
