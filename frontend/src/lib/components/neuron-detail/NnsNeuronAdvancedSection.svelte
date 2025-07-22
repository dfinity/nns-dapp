<script lang="ts">
  import NnsNeuronPublicVisibilityAction from "$lib/components/neuron-detail/NnsNeuronPublicVisibilityAction.svelte";
  import JoinCommunityFundCheckbox from "$lib/components/neuron-detail/actions/JoinCommunityFundCheckbox.svelte";
  import NnsAutoStakeMaturity from "$lib/components/neuron-detail/actions/NnsAutoStakeMaturity.svelte";
  import SplitNnsNeuronButton from "$lib/components/neuron-detail/actions/SplitNnsNeuronButton.svelte";
  import NnsNeuronAge from "$lib/components/neurons/NnsNeuronAge.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
  import { secondsToDate, secondsToDateTime } from "$lib/utils/date.utils";
  import {
    canUserManageNeuronFundParticipation,
    getDissolvingTimestampSeconds,
    isNeuronControllable,
    maturityLastDistribution,
  } from "$lib/utils/neuron.utils";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
    Section,
  } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });

  let canManageNFParticipation: boolean;
  $: canManageNFParticipation = canUserManageNeuronFundParticipation({
    neuron,
    accounts: $icpAccountsStore,
    identity: $authStore.identity,
  });

  let dissolvingTimestamp: bigint | undefined;
  $: dissolvingTimestamp = getDissolvingTimestampSeconds(neuron);
</script>

<Section testId="nns-neuron-advanced-section-component">
  {#snippet title()}<h3>{$i18n.neuron_detail.advanced_settings_title}</h3
    >{/snippet}
  <div class="content">
    <div class="visibility-action-container">
      <NnsNeuronPublicVisibilityAction {neuron} />
    </div>
    <KeyValuePair>
      {#snippet key()}
        <span class="label">{$i18n.neurons.neuron_id}</span>{/snippet}
      {#snippet value()}<span class="value" data-tid="neuron-id"
          >{neuron.neuronId}</span
        >{/snippet}
    </KeyValuePair>
    <KeyValuePair>
      {#snippet key()}<span class="label">{$i18n.neuron_detail.created}</span
        >{/snippet}
      {#snippet value()}<span class="value" data-tid="neuron-created"
          >{secondsToDateTime(neuron.createdTimestampSeconds)}</span
        >{/snippet}
    </KeyValuePair>
    <NnsNeuronAge {neuron} />
    {#if nonNullish(dissolvingTimestamp)}
      <KeyValuePair>
        {#snippet key()}<span class="label"
            >{$i18n.neuron_detail.dissolve_date}</span
          >{/snippet}
        {#snippet value()}<span class="value" data-tid="neuron-dissolve-date"
            >{secondsToDateTime(dissolvingTimestamp)}</span
          >{/snippet}
      </KeyValuePair>
    {/if}
    {#if nonNullish(neuron.fullNeuron)}
      <KeyValuePair testId="neuron-account-row">
        {#snippet key()}<span class="label"
            >{$i18n.neuron_detail.neuron_account}</span
          >{/snippet}
        {#snippet value()}<Hash
            className="value"
            tagName="span"
            testId="neuron-account"
            text={neuron.fullNeuron.accountIdentifier}
            id="neuron-account"
            showCopy
          />{/snippet}
      </KeyValuePair>
    {/if}
    {#if nonNullish($nnsLatestRewardEventStore)}
      <!-- Extra div to avoid the gap of the flex container to be applied between the collapsible header and its content -->
      <div>
        <KeyValuePairInfo>
          {#snippet key()}<span class="label"
              >{$i18n.neuron_detail.maturity_last_distribution}</span
            >{/snippet}
          {#snippet value()}<span
              class="value"
              data-tid="last-rewards-distribution"
              >{secondsToDate(
                Number(
                  maturityLastDistribution(
                    $nnsLatestRewardEventStore.rewardEvent
                  )
                )
              )}</span
            >{/snippet}
          {#snippet info()}<Html
              text={$i18n.neuron_detail.maturity_last_distribution_info}
            />{/snippet}
        </KeyValuePairInfo>
      </div>
    {/if}

    <NnsAutoStakeMaturity {neuron} />
    {#if canManageNFParticipation}
      <JoinCommunityFundCheckbox {neuron} />
    {/if}

    {#if isControllable}
      <SplitNnsNeuronButton {neuron} />
    {/if}
  </div>
</Section>

<style lang="scss">
  h3 {
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-2x);

    padding: 0;

    --checkbox-padding: 0;
    --checkbox-label-order: 1;
  }

  .visibility-action-container {
    width: 100%;
    padding: var(--padding) 0;
  }
</style>
