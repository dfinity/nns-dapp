<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsTopicKey } from "$lib/types/sns";
  import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
  import {
    getSnsTopicInfoKey,
    getLegacyFolloweesByTopics,
  } from "$lib/utils/sns-topics.utils";
  import { Collapsible, IconErrorOutline } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import FollowSnsNeuronsByTopicLegacyFollowee from "$lib/modals/sns/neurons//FollowSnsNeuronsByTopicLegacyFollowee.svelte";

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

  const selectedTopicInfos = $derived(
    topicInfos.filter((topicInfo) =>
      selectedTopics.includes(getSnsTopicInfoKey(topicInfo))
    )
  );
  const topicsWithLegacyFollowees = $derived(
    selectedTopicInfos.filter(
      (topicInfo) =>
        getLegacyFolloweesByTopics({
          neuron,
          topicInfos: [topicInfo],
        }).length > 0
    )
  );
  const legacyFollowees = $derived(
    selectedTopicInfos.flatMap((topicInfo) =>
      getLegacyFolloweesByTopics({
        neuron,
        topicInfos: [topicInfo],
      })
    )
  );
</script>

<TestIdWrapper testId="follow-sns-neurons-by-topic-step-legacy-component">
  <div class="header">
    <div class="icon-wrapper">
      <IconErrorOutline size="75px" />
    </div>
    <p class="description">{$i18n.follow_sns_topics.legacy_description}</p>
  </div>

  <Separator spacing="medium" />

  <h5>{$i18n.follow_sns_topics.legacy_topics_header}</h5>
  <ul class="list topic-names">
    {#each topicsWithLegacyFollowees as topicInfo (getSnsTopicInfoKey(topicInfo))}
      <li data-tid="topic-name">{topicInfo.name}</li>
    {/each}
  </ul>

  <Collapsible testId="collapsible">
    <h5 slot="header">{$i18n.follow_sns_topics.legacy_followees_header}</h5>

    <ul class="list legacy-followings">
      {#each legacyFollowees as followees (followees.nsFunction.id)}
        {#each followees.followees as neuronId (subaccountToHexString(neuronId.id))}
          <li>
            <FollowSnsNeuronsByTopicLegacyFollowee
              nsFunction={followees.nsFunction}
              {neuronId}
            />
          </li>
        {/each}
      {/each}
    </ul>
  </Collapsible>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="back-button"
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
    margin: 0 var(--padding-4x);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding-2x);

    .description {
      @include fonts.standard(true);
      text-align: center;
    }
  }

  h5 {
    @include fonts.h5(true);
    color: var(--text-description);
    margin-bottom: var(--padding-1_5x);
  }

  .icon-wrapper {
    padding: var(--padding-3x);
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    color: var(--elements-icons);
    background-color: var(--tag-background);
  }

  .list {
    margin-bottom: var(--padding-3x);
    padding: 0;
    list-style-type: none;
    display: flex;

    &.topic-names {
      flex-direction: column;
      gap: var(--padding-1_5x);
    }

    &.legacy-followings {
      flex-wrap: wrap;
      gap: var(--padding);
    }
  }
</style>
