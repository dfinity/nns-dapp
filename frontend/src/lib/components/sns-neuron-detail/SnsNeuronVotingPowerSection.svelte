<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formattedStakedMaturity,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { type Token, fromDefinedNullable } from "@dfinity/utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import SnsStakeItemAction from "./SnsStakeItemAction.svelte";
  import type { Universe } from "$lib/types/universe";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import SnsNeuronStateItemAction from "./SnsNeuronStateItemAction.svelte";
  import SnsNeuronDissolveDelayActionItem from "./SnsNeuronDissolveDelayActionItem.svelte";
  import { formatToken } from "$lib/utils/token.utils";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { Html, Section } from "@dfinity/gix-components";

  export let parameters: SnsNervousSystemParameters;
  export let neuron: SnsNeuron;
  export let token: Token;

  let universe: Universe;
  $: universe = $selectedUniverseStore;

  let votingPower: number;
  $: votingPower = snsNeuronVotingPower({ neuron, snsParameters: parameters });

  let canVote: boolean;
  $: canVote = votingPower > 0;
</script>

<Section testId="sns-neuron-voting-power-section-component">
  <h3 slot="title">{$i18n.neurons.voting_power}</h3>
  <p slot="end" class="title-value" data-tid="voting-power">
    {#if votingPower > 0}
      {formatVotingPower(votingPower)}
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
            value: getSnsNeuronStake(neuron),
          }),
          $maturityStaked: formattedStakedMaturity(neuron),
          $ageBonus: ageMultiplier({
            neuron,
            snsParameters: parameters,
          }).toFixed(2),
          $dissolveBonus: dissolveDelayMultiplier({
            neuron,
            snsParameters: parameters,
          }).toFixed(2),
          $votingPower: formatVotingPower(votingPower),
        }
      )}
    {:else}
      <Html
        text={replacePlaceholders(
          $i18n.neuron_detail.voting_power_section_description_expanded_zero,
          {
            $minDuration: secondsToDuration(
              fromDefinedNullable(
                parameters.neuron_minimum_dissolve_delay_to_vote_seconds
              )
            ),
            $rootCanisterId: universe.canisterId,
            $neuronId: getSnsNeuronIdAsHexString(neuron),
          }
        )}
      />
    {/if}
  </p>
  <ul class="content">
    <SnsStakeItemAction {neuron} {token} {universe} />
    <SnsNeuronStateItemAction {neuron} snsParameters={parameters} />
    <SnsNeuronDissolveDelayActionItem {neuron} {parameters} />
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
