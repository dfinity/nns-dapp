<script lang="ts">
  import SnsNeuronDissolveDelayItemAction from "$lib/components/sns-neuron-detail/SnsNeuronDissolveDelayItemAction.svelte";
  import SnsNeuronStateItemAction from "$lib/components/sns-neuron-detail/SnsNeuronStateItemAction.svelte";
  import SnsStakeItemAction from "$lib/components/sns-neuron-detail/SnsStakeItemAction.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formattedStakedMaturity,
    getSnsNeuronStake,
    neuronDashboardUrl,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { Html, Section } from "@dfinity/gix-components";
  import { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import {
    fromDefinedNullable,
    secondsToDuration,
    type Token,
  } from "@dfinity/utils";

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
  <svelte:fragment slot="description">
    {#if canVote}
      <p class="description">
        {$i18n.neuron_detail.calculated_as}
      </p>
      <p class="description calculation">
        {$i18n.neuron_detail.voting_power_section_calculation_generic}
      </p>
      <p class="description">
        {$i18n.neuron_detail.this_neuron_calculation}
      </p>
      <p class="description calculation" data-tid="voting-power-description">
        {replacePlaceholders(
          $i18n.neuron_detail.voting_power_section_calculation_specific,
          {
            $stake: formatTokenE8s({
              value: getSnsNeuronStake(neuron),
            }),
            $maturityStaked: formattedStakedMaturity(neuron),
            $ageMultiplier: ageMultiplier({
              neuron,
              snsParameters: parameters,
            }).toFixed(2),
            $dissolveMultiplier: dissolveDelayMultiplier({
              neuron,
              snsParameters: parameters,
            }).toFixed(2),
            $votingPower: formatVotingPower(votingPower),
          }
        )}
      </p>
    {:else}
      <p class="description" data-tid="voting-power-description">
        <Html
          text={replacePlaceholders(
            $i18n.neuron_detail.voting_power_section_description_expanded_zero,
            {
              $minDuration: secondsToDuration({
                seconds: fromDefinedNullable(
                  parameters.neuron_minimum_dissolve_delay_to_vote_seconds
                ),
                i18n: $i18n.time,
              }),
              $dashboardLink: neuronDashboardUrl({
                neuron,
                rootCanisterId: Principal.fromText(universe.canisterId),
              }),
            }
          )}
        />
      </p>
    {/if}
  </svelte:fragment>
  <ul class="content">
    <SnsStakeItemAction {neuron} {token} {universe} />
    <SnsNeuronStateItemAction {neuron} snsParameters={parameters} {token} />
    <SnsNeuronDissolveDelayItemAction {neuron} {parameters} {token} />
  </ul>
</Section>

<style lang="scss">
  h3 {
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

  .calculation {
    font-family: monospace;
    font-size: 12px;
  }
</style>
