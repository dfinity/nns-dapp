<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import KeyValuePair from "$lib/components/ui/KeyValuePair.svelte";
  import KeyValuePairInfo from "$lib/components/ui/KeyValuePairInfo.svelte";
  import StakeMaturityButton from "./actions/StakeMaturityButton.svelte";
  import MergeMaturityButton from "./actions/MergeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import AutoStakeMaturity from "./actions/AutoStakeMaturity.svelte";
  import {
    formattedMaturity,
    isNeuronControllable,
    formattedStakedMaturity,
    isNeuronControlledByHardwareWallet,
  } from "$lib/utils/neuron.utils";
  import { accountsStore } from "$lib/stores/accounts.store";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });

  let controlledByHardwareWallet: boolean;
  $: controlledByHardwareWallet = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: $accountsStore,
  });
</script>

<CardInfo>
  <KeyValuePairInfo testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <svelte:fragment slot="info"
      >{controlledByHardwareWallet
        ? $i18n.neuron_detail.merge_maturity_tooltip
        : $i18n.neuron_detail.stake_maturity_tooltip}</svelte:fragment
    >
    <h3 slot="value">{formattedMaturity(neuron)}</h3>
  </KeyValuePairInfo>

  {#if neuron.fullNeuron?.stakedMaturityE8sEquivalent !== undefined}
    <KeyValuePair testId="staked-maturity">
      <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>

      <span slot="value" class="staked-maturity"
        >{formattedStakedMaturity(neuron)}</span
      >
    </KeyValuePair>
  {/if}

  {#if isControllable}
    <div class="actions">
      {#if controlledByHardwareWallet}
        <MergeMaturityButton {neuron} />
      {:else}
        <StakeMaturityButton {neuron} />
      {/if}

      <SpawnNeuronButton {neuron} {controlledByHardwareWallet} />
    </div>

    {#if !controlledByHardwareWallet}
      <AutoStakeMaturity {neuron} />
    {/if}
  {/if}
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--padding);
    padding-top: var(--padding-2x);
  }

  .staked-maturity {
    margin: var(--padding-0_5x) 0 0;
  }
</style>
