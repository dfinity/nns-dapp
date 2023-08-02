<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    formattedStakedMaturity,
    neuronDashboardUrl,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import NnsStakeItemAction from "./NnsStakeItemAction.svelte";
  import NnsNeuronStateItemAction from "./NnsNeuronStateItemAction.svelte";
  import NnsNeuronDissolveDelayActionItem from "./NnsNeuronDissolveDelayActionItem.svelte";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { formatToken } from "$lib/utils/token.utils";
  import { Html, Section } from "@dfinity/gix-components";

  export let neuron: NeuronInfo;

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
  <p class="description" slot="description" data-tid="voting-power-description">
    {#if canVote}
      {replacePlaceholders(
        $i18n.neuron_detail.voting_power_section_description_expanded,
        {
          $stake: formatToken({
            value: neuronStake(neuron),
          }),
          $maturityStaked: formattedStakedMaturity(neuron),
          $ageBonus: ageMultiplier(neuron.ageSeconds).toFixed(2),
          $dissolveBonus: dissolveDelayMultiplier(
            neuron.dissolveDelaySeconds
          ).toFixed(2),
          $votingPower: formatVotingPower(neuron.votingPower),
        }
      )}
    {:else}
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail
            .voting_power_section_description_expanded_zero_nns,
          { $dashboardLink: neuronDashboardUrl(neuron) }
        )}
      />
    {/if}
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
