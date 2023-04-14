<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
  } from "@dfinity/gix-components";
  import NnsStakeMaturityButton from "./actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import NnsAutoStakeMaturity from "./actions/NnsAutoStakeMaturity.svelte";
  import {
    isNeuronControllable,
    formattedStakedMaturity,
    formattedTotalMaturity,
  } from "$lib/utils/neuron.utils";
  import { accountsStore } from "$lib/stores/accounts.store";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
  import { nonNullish } from "@dfinity/utils";
  import { secondsToDate } from "$lib/utils/date.utils";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });

  let showDetails: boolean;
  $: showDetails =
    nonNullish(neuron.fullNeuron?.stakedMaturityE8sEquivalent) ||
    nonNullish($nnsLatestRewardEventStore);
</script>

<CardInfo>
  <KeyValuePairInfo testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <svelte:fragment slot="info"
      ><Html
        text={$i18n.neuron_detail.stake_maturity_tooltip}
      /></svelte:fragment
    >
    <h3 slot="value">{formattedTotalMaturity(neuron)}</h3>
  </KeyValuePairInfo>

  {#if showDetails}
    <div class="details">
      {#if nonNullish(neuron.fullNeuron?.stakedMaturityE8sEquivalent)}
        <KeyValuePair testId="staked-maturity">
          <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>
          <span slot="value">{formattedStakedMaturity(neuron)}</span>
        </KeyValuePair>
      {/if}

      {#if nonNullish($nnsLatestRewardEventStore)}
        <KeyValuePair testId="last-distribution-maturity">
          <svelte:fragment slot="key"
            >{$i18n.neuron_detail.maturity_last_distribution}</svelte:fragment
          >
          <span slot="value"
            >{secondsToDate(
              Number(
                $nnsLatestRewardEventStore.rewardEvent.actual_timestamp_seconds
              )
            )}</span
          >
        </KeyValuePair>
      {/if}
    </div>
  {/if}

  {#if isControllable}
    <div class="actions">
      <NnsStakeMaturityButton {neuron} />
      <SpawnNeuronButton {neuron} />
    </div>
  {/if}

  <NnsAutoStakeMaturity {neuron} />
</CardInfo>

<Separator />

<style lang="scss">
  @use "../../themes/mixins/neuron";

  @include neuron.maturity-card-info;
</style>
