<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsTopicKey } from "$lib/types/sns";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import {
    getSnsTopicInfoKey,
    getTopicsLegacyFollowees,
  } from "$lib/utils/sns-topics.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import { nonNullish } from "@dfinity/utils";
  import { subaccountToHexString } from "../../../utils/sns-neuron.utils";
  import FollowSnsNeuronsByTopicLegacyFollowee from "./FollowSnsNeuronsByTopicLegacyFollowee.svelte";
  import {
    IconError,
    IconErrorOutline,
    IconInfo,
  } from "@dfinity/gix-components";

  type Props = {
    neuron: SnsNeuron;
    topicInfos: TopicInfoWithUnknown[];
    selectedTopics: SnsTopicKey[];
    openNextStep: () => void;
    openPrevStep: () => void;
  };
  let {
    neuron,
    topicInfos,
    selectedTopics = $bindable(),
    openNextStep,
    openPrevStep,
  }: Props = $props();

  const legacyFollowees = $derived(
    selectedTopics
      .map((topicKey) => {
        const topicInfo = topicInfos.find(
          (topicInfo) => getSnsTopicInfoKey(topicInfo) === topicKey
        );
        return (
          (nonNullish(topicInfo) &&
            getTopicsLegacyFollowees({
              neuron,
              topicInfos: [topicInfo],
            })) ||
          []
        );
      })
      .flat()
  );
</script>

<TestIdWrapper testId="follow-sns-neurons-by-topic-step-topics-component">
  <div class="header">
    <IconErrorOutline size="70px" />
    <p class="description"
      >You currently have legacy following active. Any changes on topic
      following will override your current settings. Please confirm changes to
      proceed.</p
    >
  </div>

  <Separator spacing="medium" />

  <h5>Current legacy following</h5>

  <ul class="followee-list">
    {#each legacyFollowees as followees (followees.nsFunction.id)}
      {#each followees.followees as neuronId (subaccountToHexString(neuronId.id))}
        <li>
          <FollowSnsNeuronsByTopicLegacyFollowee
            nsFunction={followees.nsFunction}
            {neuronId}
            onRemoveClick={() => {}}
          />
        </li>
      {/each}
    {/each}
  </ul>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      onclick={openPrevStep}
    >
      {$i18n.core.back}
    </button>

    <button
      data-tid="next-button"
      class="primary"
      disabled={selectedTopics.length === 0}
      onclick={openNextStep}
    >
      {$i18n.core.next}
    </button>
  </div>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding);
  }

  .legacy-description {
    @include fonts.small();
    margin-bottom: var(--padding);
  }

  .followee-list {
    padding: 0;
    list-style-type: none;

    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
  }
</style>
