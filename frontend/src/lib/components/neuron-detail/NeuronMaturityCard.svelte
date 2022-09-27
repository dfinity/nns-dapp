<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import CardInfo from "../ui/CardInfo.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";
  import KeyValuePairInfo from "../ui/KeyValuePairInfo.svelte";
  import StakeMaturityButton from "./actions/StakeMaturityButton.svelte";
  import MergeMaturityButton from "./actions/MergeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import {
    formattedMaturity,
    isNeuronControllable,
    formattedStakedMaturity,
    isNeuronControlledByHardwareWallet,
  } from "../../utils/neuron.utils";
  import { accountsStore } from "../../stores/accounts.store";

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
      >{$i18n.neuron_detail.maturity_tooltip}</svelte:fragment
    >
    <h3 slot="value">{formattedMaturity(neuron)}</h3>
  </KeyValuePairInfo>

  {#if neuron.fullNeuron?.stakedMaturityE8sEquivalent !== undefined}
    <KeyValuePair testId="staked-maturity">
      <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>

      <svelte:fragment slot="value"
        >{formattedStakedMaturity(neuron)}</svelte:fragment
      >
    </KeyValuePair>
  {/if}

  <div class="actions">
    {#if isControllable}
      {#if controlledByHardwareWallet}
        <MergeMaturityButton {neuron} />
      {:else}
        <StakeMaturityButton {neuron} />
      {/if}

      <SpawnNeuronButton {neuron} {controlledByHardwareWallet} />
    {/if}
  </div>
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    gap: var(--padding);
    padding-top: var(--padding);
  }
</style>
