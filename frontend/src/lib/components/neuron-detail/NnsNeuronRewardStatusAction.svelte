<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    getVotingPowerRefreshedTimestampSeconds,
    isNeuronLosingRewards,
    secondsUntilLosingRewards,
    shouldDisplayRewardLossNotification,
  } from "$lib/utils/neuron.utils";
  import {
    IconCheckCircle,
    IconError,
    IconWarning,
  } from "@dfinity/gix-components";
  import CommonItemAction from "../ui/CommonItemAction.svelte";
  import { type NeuronInfo } from "@dfinity/nns";
  import { secondsToDuration } from "@dfinity/utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { secondsToDate } from "$lib/utils/date.utils";
  import { START_REDUCING_VOTING_POWER_AFTER_SECONDS } from "$lib/constants/neurons.constants";

  export let neuron: NeuronInfo;

  let isLosingRewards = false;
  $: isLosingRewards = isNeuronLosingRewards(neuron);

  let isLosingRewardsSoon = false;
  $: isLosingRewardsSoon =
    !isLosingRewards && shouldDisplayRewardLossNotification(neuron);

  const getIcon = (neuron: NeuronInfo) =>
    isLosingRewards
      ? IconError
      : isLosingRewardsSoon
        ? IconWarning
        : // TODO(mstr): Replace with the filled version.
          IconCheckCircle;
  const getTitle = (neuron: NeuronInfo): string =>
    isLosingRewards
      ? $i18n.neuron_detail.reward_status_inactive
      : isLosingRewardsSoon
        ? $i18n.neuron_detail.reward_status_losing_soon
        : $i18n.neuron_detail.reward_status_active;
  const getDescription = (neuron: NeuronInfo): string =>
    isLosingRewards
      ? replacePlaceholders(
          $i18n.neuron_detail.reward_status_inactive_description,
          {
            $date: secondsToDate(
              Number(getVotingPowerRefreshedTimestampSeconds(neuron)) +
                START_REDUCING_VOTING_POWER_AFTER_SECONDS
            ),
          }
        )
      : replacePlaceholders(
          $i18n.neuron_detail.reward_status_losing_soon_description,
          {
            $time: secondsToDuration({
              seconds: BigInt(secondsUntilLosingRewards(neuron)),
              i18n: $i18n.time,
            }),
          }
        );
</script>

<CommonItemAction testId="nns-neuron-reward-status-action-component">
  <span
    slot="icon"
    class="icon"
    class:isLosingRewards
    class:isLosingRewardsSoon
  >
    <svelte:component this={getIcon(neuron)} />
  </span>
  <span slot="title" data-tid="state-title">
    {getTitle(neuron)}
  </span>

  <span
    slot="subtitle"
    class="description"
    class:negative={isLosingRewards || isLosingRewardsSoon}
    data-tid="state-description"
  >
    {getDescription(neuron)}
  </span>

  <!-- TODO(mstr): Add a button to confirm following. -->
</CommonItemAction>

<style lang="scss">
  .icon {
    color: var(--positive-emphasis);

    &.isLosingRewardsSoon {
      color: var(--warning-emphasis);
    }

    &.isLosingRewards {
      color: var(--negative-emphasis);
    }
  }

  .description {
    &.negative {
      color: var(--negative-emphasis);
    }
  }
</style>
