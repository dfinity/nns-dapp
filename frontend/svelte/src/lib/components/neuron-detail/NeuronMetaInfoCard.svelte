<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import IconInfo from "../../icons/IconInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import { secondsToDate } from "../../utils/date.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formatVotingPower,
  } from "../../utils/neuron.utils";
  import NeuronCard from "../neurons/NeuronCard.svelte";
  import Tooltip from "../ui/Tooltip.svelte";

  export let neuron: NeuronInfo;
</script>

<NeuronCard {neuron}>
  <section>
    <div class="space-between">
      <p>
        {secondsToDate(Number(neuron.createdTimestampSeconds))} - {$i18n.neurons
          .staked}
      </p>
      <button class="primary small"
        >{$i18n.neuron_detail.join_community_fund}</button
      >
    </div>
    <div class="space-between">
      <p class="voting-power">
        {#if neuron.votingPower}
          {`${$i18n.neurons.voting_power}:`}
          <span class="amount">
            {formatVotingPower(neuron.votingPower)}
          </span>
          {#if neuron.fullNeuron?.cachedNeuronStake !== undefined}
            <Tooltip
              id="voting-power-info"
              text={replacePlaceholders(
                $i18n.neuron_detail.voting_power_tooltip,
                {
                  $stake: formatICP(neuron.fullNeuron.cachedNeuronStake),
                  $delayMultiplier: dissolveDelayMultiplier(
                    Number(neuron.dissolveDelaySeconds)
                  ).toFixed(2),
                  $ageMultiplier: ageMultiplier(
                    Number(neuron.ageSeconds)
                  ).toFixed(2),
                }
              )}
            >
              <span>
                <IconInfo />
              </span>
            </Tooltip>
          {/if}
        {/if}
      </p>
      <div class="buttons">
        <button class="primary small"
          >{$i18n.neuron_detail.increase_dissolve_delay}</button
        >
        <button class="warning small"
          >{$i18n.neuron_detail.start_dissolving}</button
        >
      </div>
    </div>
    <div class="only-buttons">
      <button class="primary small">{$i18n.neuron_detail.increase_stake}</button
      >
      <button class="primary small">{$i18n.neuron_detail.split_neuron}</button>
    </div>
  </section>
</NeuronCard>

<style lang="scss">
  @use "../../themes/mixins/media";
  section {
    padding: var(--padding) 0 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
  .space-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    @include media.min-width(small) {
      flex-wrap: nowrap;
    }
  }

  .voting-power {
    display: flex;
    align-items: center;
    gap: calc(0.5 * var(--padding));

    span {
      display: flex;
      align-items: center;
    }

    .amount {
      font-weight: bold;
    }
  }

  .only-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);

    @include media.min-width(small) {
      justify-content: end;
    }
  }

  .buttons {
    display: flex;
    gap: var(--padding);
  }
</style>
