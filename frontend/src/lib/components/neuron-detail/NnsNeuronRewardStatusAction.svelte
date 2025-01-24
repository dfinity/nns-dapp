<script lang="ts">
  import ConfirmFollowingActionButton from "$lib/components/neuron-detail/actions/ConfirmFollowingActionButton.svelte";
  import FollowNeuronsButton from "$lib/components/neuron-detail/actions/FollowNeuronsButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    isNeuronFollowingResetVPE,
    isNeuronLosingRewardsVPE,
    secondsUntilLosingRewardsVPE,
    shouldDisplayRewardLossNotificationVPE,
  } from "$lib/utils/neuron.utils";
  import {
    IconCheckCircleFill,
    IconError,
    IconWarning,
  } from "@dfinity/gix-components";
  import { type NeuronInfo } from "@dfinity/nns";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";
  import {
    clearFollowingAfterSecondsStore,
    startReducingVotingPowerAfterSecondsStore,
  } from "$lib/derived/network-economics.derived";

  export let neuron: NeuronInfo;

  let isFollowingReset = false;
  $: isFollowingReset = isNeuronFollowingResetVPE({
    neuron,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
    clearFollowingAfterSeconds: $clearFollowingAfterSecondsStore,
  });

  let isLosingRewards = false;
  $: isLosingRewards = isNeuronLosingRewardsVPE({
    neuron,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
  });

  let isLosingRewardsSoon = false;
  $: isLosingRewardsSoon =
    !isLosingRewards &&
    shouldDisplayRewardLossNotificationVPE({
      neuron,
      startReducingVotingPowerAfterSeconds:
        $startReducingVotingPowerAfterSecondsStore,
    });

  let icon: typeof IconError | typeof IconWarning | typeof IconCheckCircleFill;
  $: icon =
    isFollowingReset || isLosingRewards
      ? IconError
      : isLosingRewardsSoon
        ? IconWarning
        : IconCheckCircleFill;

  let title: string;
  $: title =
    isFollowingReset || isLosingRewards
      ? $i18n.neuron_detail.reward_status_inactive
      : isLosingRewardsSoon
        ? $i18n.neuron_detail.reward_status_losing_soon
        : $i18n.neuron_detail.reward_status_active;

  const getDescription = ({
    neuron,
    startReducingVotingPowerAfterSeconds,
  }: {
    neuron: NeuronInfo;
    startReducingVotingPowerAfterSeconds: bigint;
  }): string => {
    if (isFollowingReset)
      return $i18n.neuron_detail.reward_status_inactive_reset_description;

    if (isLosingRewards)
      return $i18n.neuron_detail.reward_status_inactive_description;

    const timeUntilLoss = secondsToDuration({
      seconds: BigInt(
        secondsUntilLosingRewardsVPE({
          neuron,
          startReducingVotingPowerAfterSeconds,
        })
      ),
      i18n: $i18n.time,
    });
    return replacePlaceholders(
      $i18n.neuron_detail.reward_status_losing_soon_description,
      {
        $time: timeUntilLoss,
      }
    );
  };
</script>

{#if nonNullish($startReducingVotingPowerAfterSecondsStore) && nonNullish($clearFollowingAfterSecondsStore)}
  <CommonItemAction
    testId="nns-neuron-reward-status-action-component"
    tooltipText={replacePlaceholders($i18n.losing_rewards.description, {
      $period: secondsToDissolveDelayDuration(
        $startReducingVotingPowerAfterSecondsStore
      ),
    })}
    tooltipId="neuron-reward-status-icon"
  >
    <span
      slot="icon"
      class="icon"
      class:isLosingRewards
      class:isLosingRewardsSoon
    >
      <svelte:component this={icon} />
    </span>
    <span slot="title" data-tid="state-title">
      {title}
    </span>

    <span
      slot="subtitle"
      class="description"
      class:negative={isLosingRewards || isLosingRewardsSoon}
      data-tid="state-description"
    >
      {getDescription({
        neuron,
        startReducingVotingPowerAfterSeconds:
          $startReducingVotingPowerAfterSecondsStore,
      })}
    </span>

    {#if isFollowingReset}
      <FollowNeuronsButton variant="secondary" />
    {:else}
      <ConfirmFollowingActionButton {neuron} />
    {/if}
  </CommonItemAction>
{/if}

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
