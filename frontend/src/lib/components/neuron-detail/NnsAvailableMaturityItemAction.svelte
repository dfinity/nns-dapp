<script lang="ts">
  import NnsStakeMaturityButton from "$lib/components/neuron-detail/actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "$lib/components/neuron-detail/actions/SpawnNeuronButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    formattedMaturity,
    isNeuronControllable,
    isNeuronControlledByHardwareWallet,
  } from "$lib/utils/neuron.utils";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import NnsDisburseMaturityButton from "$lib/components/neuron-detail/actions/NnsDisburseMaturityButton.svelte";
  import { ENABLE_DISBURSE_MATURITY } from "$lib/stores/feature-flags.store";

  type Props = {
    neuron: NeuronInfo;
  };

  const { neuron }: Props = $props();
  const isControllable = $derived(
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
    })
  );
  const isControlledByHardwareWallet = $derived(
    isNeuronControlledByHardwareWallet({
      neuron,
      accounts: $icpAccountsStore,
    })
  );
  const isDisburseMaturityAvailable = $derived(
    isControllable && !isControlledByHardwareWallet && $ENABLE_DISBURSE_MATURITY
  );
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
    {#if isDisburseMaturityAvailable}
      <NnsDisburseMaturityButton {neuron} />
    {:else}
      <SpawnNeuronButton {neuron} />
    {/if}
  {/if}
</CommonItemAction>
