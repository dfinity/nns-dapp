<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    isNeuronFollowingReset,
    isNeuronLosingRewards,
    secondsUntilLosingRewards,
    shouldDisplayRewardLossNotification,
  } from "$lib/utils/neuron.utils";
  import {
    IconCheckCircle,
    IconError,
    IconWarning,
  } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { type NeuronInfo } from "@dfinity/nns";
  import { secondsToDuration } from "@dfinity/utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import FollowNeuronsButton from "./actions/FollowNeuronsButton.svelte";
  import ConfirmFollowingButton from "./actions/ConfirmFollowingButton.svelte";

  export let neuron: NeuronInfo;

  let isFollowingReset = false;
  $: isFollowingReset = isNeuronFollowingReset(neuron);

  let isLosingRewards = false;
  $: isLosingRewards = isNeuronLosingRewards(neuron);

  let isLosingRewardsSoon = false;
  $: isLosingRewardsSoon =
    !isLosingRewards && shouldDisplayRewardLossNotification(neuron);

  let icon: typeof IconError | typeof IconWarning | typeof IconCheckCircle;
  $: icon =
    isFollowingReset || isLosingRewards
      ? IconError
      : isLosingRewardsSoon
        ? IconWarning
        : // TODO(mstr): Replace with the filled version.
          IconCheckCircle;

  let title: string;
  $: title =
    isFollowingReset || isLosingRewards
      ? $i18n.neuron_detail.reward_status_inactive
      : isLosingRewardsSoon
        ? $i18n.neuron_detail.reward_status_losing_soon
        : $i18n.neuron_detail.reward_status_active;

  const getDescription = (neuron: NeuronInfo): string => {
    if (isFollowingReset)
      return $i18n.neuron_detail.reward_status_inactive_reset_description;

    if (isLosingRewards)
      return $i18n.neuron_detail.reward_status_inactive_description;

    const timeUntilLoss = secondsToDuration({
      seconds: BigInt(secondsUntilLosingRewards(neuron)),
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

<CommonItemAction testId="nns-neuron-reward-status-action-component">
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
    {getDescription(neuron)}
  </span>

  {#if isFollowingReset}
    <FollowNeuronsButton />
  {:else}
    <ConfirmFollowingButton neuronIds={[neuron.neuronId]} />
  {/if}
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
