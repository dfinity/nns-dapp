<script lang="ts">
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    formattedMaturity,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import NnsStakeMaturityButton from "$lib/components/neuron-detail/actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "$lib/components/neuron-detail/actions/SpawnNeuronButton.svelte";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });
</script>

<CommonItemAction testId="nns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <span slot="title" data-tid="available-maturity"
    >{formattedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}
    <TooltipIcon
      text={$i18n.neuron_detail.nns_available_maturity_tooltip}
      tooltipId="available-maturity-tooltip"
    /></svelte:fragment
  >
  {#if isControllable}
    <NnsStakeMaturityButton {neuron} />
    <SpawnNeuronButton {neuron} />
  {/if}
</CommonItemAction>
