<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair, Section } from "@dfinity/gix-components";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import Hash from "../ui/Hash.svelte";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import SnsNeuronAge from "../sns-neurons/SnsNeuronAge.svelte";
  import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, type Token } from "@dfinity/utils";
  import SnsNeuronVestingPeriodRemaining from "./SnsNeuronVestingPeriodRemaining.svelte";
  import SnsAutoStakeMaturity from "./actions/SnsAutoStakeMaturity.svelte";
  import SplitSnsNeuronButton from "./actions/SplitSnsNeuronButton.svelte";
  import type { E8s } from "@dfinity/nns";

  export let governanceCanisterId: Principal | undefined;
  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let transactionFee: E8s;
  export let token: Token;

  let neuronAccount: IcrcAccount | undefined;
  $: neuronAccount = nonNullish(governanceCanisterId)
    ? {
        owner: governanceCanisterId,
        subaccount: neuron?.id[0]?.id,
      }
    : undefined;
</script>

<Section testId="sns-neuron-advanced-section-component">
  <h3 slot="title">{$i18n.neuron_detail.advanced_settings_title}</h3>
  <p slot="description">
    {$i18n.neuron_detail.advanced_settings_description}
  </p>
  <div class="content">
    {#if nonNullish(neuron)}
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neurons.neuron_id}</span>
        <Hash
          slot="value"
          className="value"
          tagName="span"
          testId="neuron-id"
          text={getSnsNeuronIdAsHexString(neuron)}
          showCopy
          flowLessCopy
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
            flowLessCopy
          />
        </KeyValuePair>
      {/if}
      <SnsNeuronVestingPeriodRemaining {neuron} />
    {/if}
    <SnsAutoStakeMaturity />
    <SplitSnsNeuronButton {neuron} {parameters} {transactionFee} {token} />
  </div>
</Section>

<style lang="scss">
  h3,
  p {
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
