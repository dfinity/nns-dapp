<script lang="ts">
  import ApyDisplay from "$lib/components/ic/ApyDisplay.svelte";
  import SnsNeuronVestingPeriodRemaining from "$lib/components/sns-neuron-detail/SnsNeuronVestingPeriodRemaining.svelte";
  import SnsAutoStakeMaturity from "$lib/components/sns-neuron-detail/actions/SnsAutoStakeMaturity.svelte";
  import SplitSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/SplitSnsNeuronButton.svelte";
  import SnsNeuronAge from "$lib/components/sns-neurons/SnsNeuronAge.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import type { ApyAmount } from "$lib/types/staking";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import {
    getSnsDissolvingTimestampSeconds,
    getSnsNeuronAccount,
    getSnsNeuronIdAsHexString,
    hasPermissionToSplit,
  } from "$lib/utils/sns-neuron.utils";
  import {
    KeyValuePair,
    KeyValuePairInfo,
    Section,
  } from "@dfinity/gix-components";
  import type { Principal } from "@icp-sdk/core/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    TokenAmountV2,
    fromNullable,
    nonNullish,
    type Token,
  } from "@dfinity/utils";

  export let governanceCanisterId: Principal | undefined;
  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let transactionFee: TokenAmountV2;
  export let token: Token;
  export let apy: undefined | ApyAmount;

  let neuronAccount: string | undefined;
  $: neuronAccount = nonNullish(governanceCanisterId)
    ? getSnsNeuronAccount({
        governanceCanisterId,
        neuronId: fromNullable(neuron.id)?.id,
      })
    : undefined;

  let allowedToSplit: boolean;
  $: allowedToSplit = hasPermissionToSplit({
    neuron,
    identity: $authStore.identity,
  });

  let dissolvingTimestamp: bigint | undefined;
  $: dissolvingTimestamp = getSnsDissolvingTimestampSeconds(neuron);
</script>

<Section testId="sns-neuron-advanced-section-component">
  {#snippet title()}
    <h3>{$i18n.neuron_detail.advanced_settings_title}</h3>
  {/snippet}
  <div class="content">
    <KeyValuePair>
      {#snippet key()}<span class="label">{$i18n.neurons.neuron_id}</span
        >{/snippet}
      {#snippet value()}<Hash
          className="value"
          tagName="span"
          testId="neuron-id"
          text={getSnsNeuronIdAsHexString(neuron)}
          showCopy
          id="neuron-id"
        />{/snippet}
    </KeyValuePair>
    <KeyValuePair>
      {#snippet key()}<span class="label">{$i18n.neuron_detail.created}</span
        >{/snippet}
      {#snippet value()}<span class="value" data-tid="neuron-created"
          >{secondsToDateTime(neuron.created_timestamp_seconds)}</span
        >{/snippet}
    </KeyValuePair>
    {#if nonNullish(apy)}
      <div>
        <KeyValuePairInfo>
          {#snippet key()}<span class="label"
              >{$i18n.neuron_detail.apy_and_max}</span
            >{/snippet}
          {#snippet value()}<span class="value"
              ><ApyDisplay {apy} forPortfolio={false} /></span
            >{/snippet}
          {#snippet info()}<span>{$i18n.neuron_detail.apy_and_max_tooltip}</span
            >{/snippet}
        </KeyValuePairInfo>
      </div>
    {/if}
    <SnsNeuronAge {neuron} />
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
    {#if nonNullish(neuronAccount)}
      <KeyValuePair>
        {#snippet key()}<span class="label"
            >{$i18n.neuron_detail.neuron_account}</span
          >{/snippet}
        {#snippet value()}<Hash
            className="value"
            tagName="span"
            testId="neuron-account"
            text={neuronAccount}
            id="neuron-account"
            showCopy
          />{/snippet}
      </KeyValuePair>
    {/if}
    <SnsNeuronVestingPeriodRemaining {neuron} />
    <SnsAutoStakeMaturity />

    {#if allowedToSplit}
      <SplitSnsNeuronButton {neuron} {parameters} {transactionFee} {token} />
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

    --checkbox-padding: 0;
    --checkbox-label-order: 1;
  }
</style>
