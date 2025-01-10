<script lang="ts">
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    activityMultiplier,
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
    formattedStakedMaturity,
    neuronDashboardUrl,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import NnsNeuronRewardStatusAction from "./NnsNeuronRewardStatusAction.svelte";
  import NnsNeuronDissolveDelayItemAction from "./NnsNeuronDissolveDelayItemAction.svelte";
  import NnsNeuronStateItemAction from "./NnsNeuronStateItemAction.svelte";
  import NnsStakeItemAction from "./NnsStakeItemAction.svelte";
  import { Html, KeyValuePairInfo, Section } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ENABLE_PERIODIC_FOLLOWING_CONFIRMATION } from "$lib/stores/feature-flags.store";

  export let neuron: NeuronInfo;

  // The API might return a non-zero voting power even if the neuron can't vote.
  let canVote: boolean;
  $: canVote =
    neuron.dissolveDelaySeconds >= BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);
</script>

<Section testId="nns-neuron-voting-power-section-component">
  <KeyValuePairInfo slot="description">
    <h3 class="" slot="key">{$i18n.neurons.voting_power}</h3>
    <p slot="value" class="title-value" data-tid="voting-power">
      {#if canVote}
        {formatVotingPower(neuron.decidingVotingPower ?? 0n)}
      {:else}
        {$i18n.neuron_detail.voting_power_zero}
      {/if}
    </p>

    <span class="info" slot="info">
      {#if canVote}
        <span class="info-item">
          <span class="label">
            {$i18n.neuron_detail.calculated_as}
          </span>
          <span class="calculation" data-tid="voting-power-generic-description">
            {$ENABLE_PERIODIC_FOLLOWING_CONFIRMATION
              ? $i18n.neuron_detail.voting_power_section_calculation_generic_new
              : $i18n.neuron_detail.voting_power_section_calculation_generic}
          </span>
        </span>
        <span class="info-item">
          <span class="label">
            {$i18n.neuron_detail.this_neuron_calculation}
          </span>
          <span class="calculation" data-tid="voting-power-description">
            {replacePlaceholders(
              $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION
                ? $i18n.neuron_detail
                    .voting_power_section_calculation_specific_new
                : $i18n.neuron_detail.voting_power_section_calculation_specific,
              {
                $stake: formatTokenE8s({
                  value: neuronStake(neuron),
                }),
                $maturityStaked: formattedStakedMaturity(neuron),
                $ageMultiplier: ageMultiplier(neuron.ageSeconds).toFixed(2),
                $dissolveMultiplier: dissolveDelayMultiplier(
                  neuron.dissolveDelaySeconds
                ).toFixed(2),
                $activityMultiplier: activityMultiplier(neuron).toFixed(2),
                $votingPower: formatVotingPower(
                  neuron.decidingVotingPower ?? 0n
                ),
              }
            )}
          </span>
        </span>
      {:else}
        <span data-tid="voting-power-description">
          <Html
            text={replacePlaceholders(
              $i18n.neuron_detail
                .voting_power_section_description_expanded_zero_nns,
              { $dashboardLink: neuronDashboardUrl(neuron) }
            )}
          />
        </span>
      {/if}
    </span>
  </KeyValuePairInfo>

  <ul class="content">
    <NnsStakeItemAction {neuron} />
    <NnsNeuronStateItemAction {neuron} />
    <NnsNeuronDissolveDelayItemAction {neuron} />
    {#if $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION}
      <NnsNeuronRewardStatusAction {neuron} />
    {/if}
  </ul>
</Section>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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

  .info,
  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info {
    @include fonts.small;
    gap: var(--padding-2x);

    .info-item {
      gap: var(--padding-0_5x);
    }

    .label {
      color: var(--text-color);
    }

    .calculation {
      font-family: monospace;
      font-size: 12px;
    }
  }
</style>
