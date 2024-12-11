<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconInfo } from "@dfinity/gix-components";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import {
    isNeuronLosingRewards,
    secondsUntilLosingRewards,
  } from "$lib/utils/neuron.utils";
  import { soonLosingRewardNeuronsStore } from "$lib/derived/neurons.derived";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { START_REDUCING_VOTING_POWER_AFTER_SECONDS } from "$lib/constants/neurons.constants";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import LosingRewardNeuronsModal from "$lib/modals/neurons/LosingRewardNeuronsModal.svelte";

  // The neurons in the store are sorted by the time they will lose rewards.
  let mostInactiveNeuron: NeuronInfo | undefined;
  $: mostInactiveNeuron = $soonLosingRewardNeuronsStore[0];

  const getTitle = (neuron: NeuronInfo) =>
    isNeuronLosingRewards(neuron)
      ? $i18n.losing_rewards_banner.rewards_missing_title
      : replacePlaceholders($i18n.losing_rewards_banner.days_left_title, {
          $timeLeft: secondsToDuration({
            seconds: BigInt(secondsUntilLosingRewards(neuron)),
            i18n: $i18n.time,
          }),
        });
  const text = replacePlaceholders($i18n.losing_rewards.description, {
    // TODO(mstr): Rename to secondsToRoundedDuration
    $period: secondsToDissolveDelayDuration(
      BigInt(START_REDUCING_VOTING_POWER_AFTER_SECONDS)
    ),
  });

  let isModalVisible = false;
</script>

<TestIdWrapper testId="losing-rewards-banner-component">
  {#if nonNullish(mostInactiveNeuron)}
    <Banner title={getTitle(mostInactiveNeuron)} {text}>
      <BannerIcon slot="icon" status="error">
        <IconInfo />
      </BannerIcon>
      <div slot="actions">
        <button
          data-tid="confirm-button"
          class="danger"
          on:click={() => (isModalVisible = true)}
          >{$i18n.losing_rewards.confirm}</button
        >
      </div>
    </Banner>
  {/if}

  {#if isModalVisible}
    <LosingRewardNeuronsModal on:nnsClose={() => (isModalVisible = false)} />
  {/if}
</TestIdWrapper>
