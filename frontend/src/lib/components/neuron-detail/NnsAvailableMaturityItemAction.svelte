<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    formattedMaturity,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsStakeMaturityButton from "./actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";

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
  <svelte:fragment slot="title">{formattedMaturity(neuron)}</svelte:fragment>
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}</svelte:fragment
  >
  {#if isControllable}
    <NnsStakeMaturityButton {neuron} variant="secondary" />
    <SpawnNeuronButton {neuron} />
  {/if}
</CommonItemAction>
