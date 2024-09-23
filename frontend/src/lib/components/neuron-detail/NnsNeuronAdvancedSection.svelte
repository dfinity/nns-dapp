<script lang="ts">
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
  import NnsNeuronAge from "../neurons/NnsNeuronAge.svelte";
  import Hash from "../ui/Hash.svelte";
  import JoinCommunityFundCheckbox from "./actions/JoinCommunityFundCheckbox.svelte";
  import NnsAutoStakeMaturity from "./actions/NnsAutoStakeMaturity.svelte";
  import SplitNnsNeuronButton from "./actions/SplitNnsNeuronButton.svelte";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
    Section,
  } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import NnsNeuronPublicVisibilityAction from "./NnsNeuronPublicVisibilityAction.svelte";

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
  <h3 slot="title">{$i18n.neuron_detail.advanced_settings_title}</h3>
  <div class="content">
    <NnsNeuronPublicVisibilityAction {neuron} />
    <div class="inner-section">
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neurons.neuron_id}</span>
        <span slot="value" class="value" data-tid="neuron-id"
          >{neuron.neuronId}</span
        >
      </KeyValuePair>
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neuron_detail.created}</span>
        <span slot="value" class="value" data-tid="neuron-created"
          >{secondsToDateTime(neuron.createdTimestampSeconds)}</span
        >
      </KeyValuePair>
      <NnsNeuronAge {neuron} />
      {#if nonNullish(dissolvingTimestamp)}
        <KeyValuePair>
          <span slot="key" class="label"
            >{$i18n.neuron_detail.dissolve_date}</span
          >
          <span slot="value" class="value" data-tid="neuron-dissolve-date"
            >{secondsToDateTime(dissolvingTimestamp)}</span
          >
        </KeyValuePair>
      {/if}
      {#if nonNullish(neuron.fullNeuron)}
        <KeyValuePair testId="neuron-account-row">
          <span slot="key" class="label"
            >{$i18n.neuron_detail.neuron_account}</span
          >
          <Hash
            slot="value"
            className="value"
            tagName="span"
            testId="neuron-account"
            text={neuron.fullNeuron.accountIdentifier}
            id="neuron-account"
            showCopy
          />
        </KeyValuePair>
      {/if}
      {#if nonNullish($nnsLatestRewardEventStore)}
        <!-- Extra div to avoid the gap of the flex container to be applied between the collapsible header and its content -->
        <div>
          <KeyValuePairInfo>
            <span slot="key" class="label"
              >{$i18n.neuron_detail.maturity_last_distribution}</span
            >
            <span
              slot="value"
              class="value"
              data-tid="last-rewards-distribution"
              >{secondsToDate(
                Number(
                  maturityLastDistribution(
                    $nnsLatestRewardEventStore.rewardEvent
                  )
                )
              )}</span
            >
            <svelte:fragment slot="info"
              ><Html
                text={$i18n.neuron_detail.maturity_last_distribution_info}
              /></svelte:fragment
            >
          </KeyValuePairInfo>
        </div>
      {/if}
    </div>
    <div class="inner-section">
      <NnsAutoStakeMaturity {neuron} />
      {#if canManageNFParticipation}
        <JoinCommunityFundCheckbox {neuron} />
      {/if}
    </div>
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
    gap: var(--padding-3x);

    padding: 0;
    padding-top: var(--padding);

    --checkbox-padding: 0;
    --checkbox-label-order: 1;
  }

  .inner-section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .label {
    color: var(--description-color);
  }
</style>
