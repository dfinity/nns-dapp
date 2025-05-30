<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    formattedStakedMaturity,
    formattedTotalMaturity,
    neuronAge,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { Card, KeyValuePair } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmountV2, secondsToDuration } from "@dfinity/utils";

  export let neuron: NeuronInfo;
  export let testId = "nns-neuron-detail-card-component";

  let stake: TokenAmountV2;
  $: stake = TokenAmountV2.fromUlps({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
</script>

<Card {testId}>
  <KeyValuePair testId="neuron-id">
    <span class="label" slot="key">{$i18n.neurons.neuron_id}</span>
    <span class="value" slot="value">{neuron.neuronId}</span>
  </KeyValuePair>
  <KeyValuePair testId="stake">
    <span class="label" slot="key"
      >{replacePlaceholders($i18n.neurons.ic_stake, {
        $token: ICPToken.symbol,
      })}</span
    >
    <span class="value" slot="value"
      ><AmountDisplay inline singleLine amount={stake} /></span
    >
  </KeyValuePair>
  <KeyValuePair testId="dissolve-delay">
    <span slot="key" class="label">{$i18n.neurons.dissolve_delay_title}</span>
    <span slot="value" class="value"
      >{secondsToDuration({
        seconds: neuron.dissolveDelaySeconds,
        i18n: $i18n.time,
      })}</span
    >
  </KeyValuePair>
  <KeyValuePair testId="age">
    <span class="label" slot="key">{$i18n.neurons.age}</span>
    <span class="value" slot="value" data-tid="nns-neuron-age">
      {secondsToDuration({ seconds: neuronAge(neuron), i18n: $i18n.time })}
    </span>
  </KeyValuePair>
  <KeyValuePair testId="voting-power">
    <span class="label" slot="key">{$i18n.neurons.voting_power}</span>
    <span class="value" slot="value"
      >{formatVotingPower(neuron.decidingVotingPower ?? 0n)}</span
    >
  </KeyValuePair>
  <KeyValuePair testId="maturity">
    <span class="label" slot="key">{$i18n.neuron_detail.maturity_title}</span>
    <span class="value" slot="value">{formattedTotalMaturity(neuron)}</span>
  </KeyValuePair>
  <KeyValuePair testId="staked-maturity">
    <span class="label" slot="key">{$i18n.neurons.staked}</span>
    <span slot="value">{formattedStakedMaturity(neuron)}</span>
  </KeyValuePair>
</Card>
