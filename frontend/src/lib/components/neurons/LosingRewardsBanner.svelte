<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconInfo } from "@dfinity/gix-components";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import {
    isNeuronMissingReward,
    secondsUntilMissingReward,
  } from "$lib/utils/neuron.utils";
  import { soonLosingRewardNeuronsStore } from "$lib/derived/neurons.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { secondsToRoundedDuration } from "$lib/utils/date.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import LosingRewardNeuronsModal from "$lib/modals/neurons/LosingRewardNeuronsModal.svelte";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";

  // The neurons in the store are sorted by the time they will lose rewards.
  let mostInactiveNeuron: NeuronInfo | undefined;
  $: mostInactiveNeuron = $soonLosingRewardNeuronsStore[0];

  const getTitle = ({
    neuron,
    startReducingVotingPowerAfterSeconds,
  }: {
    neuron: NeuronInfo;
    startReducingVotingPowerAfterSeconds: bigint;
  }) =>
    isNeuronMissingReward({ neuron, startReducingVotingPowerAfterSeconds })
      ? $i18n.missing_rewards_banner.rewards_missing_title
      : replacePlaceholders($i18n.missing_rewards_banner.days_left_title, {
          $timeLeft: secondsToDuration({
            seconds: BigInt(
              secondsUntilMissingReward({
                neuron,
                startReducingVotingPowerAfterSeconds,
              })
            ),
            i18n: $i18n.time,
          }),
        });

  let isModalVisible = false;
</script>

<TestIdWrapper testId="losing-rewards-banner-component">
  {#if nonNullish(mostInactiveNeuron) && nonNullish($startReducingVotingPowerAfterSecondsStore)}
    <Banner
      title={getTitle({
        neuron: mostInactiveNeuron,
        startReducingVotingPowerAfterSeconds:
          $startReducingVotingPowerAfterSecondsStore,
      })}
      text={replacePlaceholders($i18n.missing_rewards.description, {
        $period: secondsToRoundedDuration(
          $startReducingVotingPowerAfterSecondsStore
        ),
      })}
    >
      <BannerIcon slot="icon" status="error">
        <IconInfo />
      </BannerIcon>
      <div slot="actions">
        <button
          data-tid="confirm-button"
          class="danger"
          on:click={() => (isModalVisible = true)}
          >{$i18n.missing_rewards.confirm}</button
        >
      </div>
    </Banner>
  {/if}

  {#if isModalVisible}
    <LosingRewardNeuronsModal
      neurons={$soonLosingRewardNeuronsStore}
      on:nnsClose={() => (isModalVisible = false)}
    />
  {/if}
</TestIdWrapper>
