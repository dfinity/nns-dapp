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
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
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
    {#snippet key()}<span class="label">{$i18n.neurons.neuron_id}</span
      >{/snippet}
    {#snippet value()}<span class="value">{neuron.neuronId}</span>{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="stake">
    {#snippet key()}<span class="label"
        >{replacePlaceholders($i18n.neurons.ic_stake, {
          $token: ICPToken.symbol,
        })}</span
      >{/snippet}
    {#snippet value()}<span class="value"
        ><AmountDisplay inline singleLine amount={stake} /></span
      >{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="dissolve-delay">
    {#snippet key()}<span class="label"
        >{$i18n.neurons.dissolve_delay_title}</span
      >{/snippet}
    {#snippet value()}<span class="value"
        >{secondsToDuration({
          seconds: neuron.dissolveDelaySeconds,
          i18n: $i18n.time,
        })}</span
      >{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="age">
    {#snippet key()}<span class="label">{$i18n.neurons.age}</span>{/snippet}
    {#snippet value()}<span class="value" data-tid="nns-neuron-age">
        {secondsToDuration({ seconds: neuronAge(neuron), i18n: $i18n.time })}
      </span>{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="voting-power">
    {#snippet key()}<span class="label">{$i18n.neurons.voting_power}</span
      >{/snippet}
    {#snippet value()}<span class="value"
        >{formatVotingPower(neuron.decidingVotingPower ?? 0n)}</span
      >{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="maturity">
    {#snippet key()}<span class="label"
        >{$i18n.neuron_detail.maturity_title}</span
      >{/snippet}
    {#snippet value()}<span class="value">{formattedTotalMaturity(neuron)}</span
      >{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="staked-maturity">
    {#snippet key()}<span class="label">{$i18n.neurons.staked}</span>{/snippet}
    {#snippet value()}<span>{formattedStakedMaturity(neuron)}</span>{/snippet}
  </KeyValuePair>
</Card>
