<script lang="ts">
  import SnsNeuronVestingPeriodRemaining from "$lib/components/sns-neuron-detail/SnsNeuronVestingPeriodRemaining.svelte";
  import SnsAutoStakeMaturity from "$lib/components/sns-neuron-detail/actions/SnsAutoStakeMaturity.svelte";
  import SplitSnsNeuronButton from "$lib/components/sns-neuron-detail/actions/SplitSnsNeuronButton.svelte";
  import SnsNeuronAge from "$lib/components/sns-neurons/SnsNeuronAge.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import {
    getSnsDissolvingTimestampSeconds,
    getSnsNeuronIdAsHexString,
    hasPermissionToSplit,
  } from "$lib/utils/sns-neuron.utils";
  import { KeyValuePair, Section } from "@dfinity/gix-components";
  import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger-icrc";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { TokenAmountV2, nonNullish, type Token } from "@dfinity/utils";

  export let governanceCanisterId: Principal | undefined;
  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let transactionFee: TokenAmountV2;
  export let token: Token;

  let neuronAccount: IcrcAccount | undefined;
  $: neuronAccount = nonNullish(governanceCanisterId)
    ? {
        owner: governanceCanisterId,
        subaccount: neuron?.id[0]?.id,
      }
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
  <h3 slot="title">{$i18n.neuron_detail.advanced_settings_title}</h3>
  <div class="content">
    <KeyValuePair>
      <span slot="key" class="label">{$i18n.neurons.neuron_id}</span>
      <Hash
        slot="value"
        className="value"
        tagName="span"
        testId="neuron-id"
        text={getSnsNeuronIdAsHexString(neuron)}
        showCopy
        id="neuron-id"
      />
    </KeyValuePair>
    <KeyValuePair>
      <span slot="key" class="label">{$i18n.neuron_detail.created}</span>
      <span slot="value" class="value" data-tid="neuron-created"
        >{secondsToDateTime(neuron.created_timestamp_seconds)}</span
      >
    </KeyValuePair>
    <SnsNeuronAge {neuron} />
    {#if nonNullish(dissolvingTimestamp)}
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neuron_detail.dissolve_date}</span
        >
        <span slot="value" class="value" data-tid="neuron-dissolve-date"
          >{secondsToDateTime(dissolvingTimestamp)}</span
        >
      </KeyValuePair>
    {/if}
    {#if nonNullish(neuronAccount)}
      <KeyValuePair>
        <span slot="key" class="label"
          >{$i18n.neuron_detail.neuron_account}</span
        >
        <Hash
          slot="value"
          className="value"
          tagName="span"
          testId="neuron-account"
          text={encodeIcrcAccount(neuronAccount)}
          id="neuron-account"
          showCopy
        />
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
