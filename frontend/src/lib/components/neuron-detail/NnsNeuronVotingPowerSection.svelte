<script lang="ts">
  import { Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken, TokenAmount } from "@dfinity/utils";
  import { formatVotingPower, neuronStake } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import NnsStakeItemAction from "./NnsStakeItemAction.svelte";
  import NnsNeuronStateItemAction from "./NnsNeuronStateItemAction.svelte";
  import NnsNeuronDissolveDelayActionItem from "./NnsNeuronDissolveDelayActionItem.svelte";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";

  export let neuron: NeuronInfo;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote =
    neuron.dissolveDelaySeconds > BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);
</script>

<Section testId="nns-neuron-voting-power-section-component">
  <h3 slot="title">{$i18n.neurons.voting_power}</h3>
  <p slot="end" class="title-value" data-tid="voting-power">
    {#if canVote}
      {formatVotingPower(neuron.votingPower)}
    {:else}
      {$i18n.neuron_detail.voting_power_zero}
    {/if}
  </p>
  <p slot="description">
    {replacePlaceholders($i18n.neuron_detail.voting_power_section_description, {
      $token: ICPToken.symbol,
    })}
  </p>
  <ul class="content">
    <NnsStakeItemAction {neuron} />
    <NnsNeuronStateItemAction {neuron} />
    <NnsNeuronDissolveDelayActionItem {neuron} />
  </ul>
</Section>

<style lang="scss">
  h3,
  p {
    margin: 0;
  }

  .title-value {
    font-size: var(--font-size-h3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    padding: 0;
  }
</style>
