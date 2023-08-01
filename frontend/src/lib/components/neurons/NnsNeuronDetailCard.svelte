<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import {
    formatVotingPower,
    formattedStakedMaturity,
    formattedTotalMaturity,
    neuronAge,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { Card, KeyValuePair } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmount } from "@dfinity/utils";

  export let neuron: NeuronInfo;
  export let testId = "nns-neuron-detail-card-component";

  let stake: TokenAmount;
  $: stake = TokenAmount.fromE8s({
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
    <span class="label" slot="key">{$i18n.neurons.ic_stake}</span>
    <span class="value" slot="value"
      ><AmountDisplay inline singleLine amount={stake} /></span
    >
  </KeyValuePair>
  <KeyValuePair testId="dissolve-delay">
    <span slot="key" class="label">{$i18n.neurons.dissolve_delay_title}</span>
    <span slot="value" class="value"
      >{secondsToDuration(neuron.dissolveDelaySeconds)}</span
    >
  </KeyValuePair>
  <KeyValuePair testId="age">
    <span class="label" slot="key">{$i18n.neurons.age}</span>
    <span class="value" slot="value" data-tid="nns-neuron-age">
      {secondsToDuration(neuronAge(neuron))}
    </span>
  </KeyValuePair>
  <KeyValuePair testId="voting-power">
    <span class="label" slot="key">{$i18n.neurons.voting_power}</span>
    <span class="value" slot="value"
      >{formatVotingPower(neuron.votingPower)}</span
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
