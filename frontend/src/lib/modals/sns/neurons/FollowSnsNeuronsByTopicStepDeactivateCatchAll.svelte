<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import FollowSnsNeuronsByTopicLegacyFollowee from "$lib/modals/sns/neurons//FollowSnsNeuronsByTopicLegacyFollowee.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsLegacyFollowings } from "$lib/types/sns";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import { IconErrorOutline } from "@dfinity/gix-components";

  type Props = {
    catchAllFollowings: SnsLegacyFollowings;
    confirm: () => void;
    cancel: () => void;
  };
  const { catchAllFollowings, confirm, cancel }: Props = $props();
</script>

<TestIdWrapper
  testId="follow-sns-neurons-by-topic-step-deactivate-catch-all-component"
>
  <div class="header">
    <div class="icon-wrapper">
      <IconErrorOutline size="75px" />
    </div>
    <p class="description">{$i18n.follow_sns_topics.catch_all_description}</p>
  </div>

  <Separator spacing="medium" />

  <h5>{$i18n.follow_sns_topics.legacy_followees_header}</h5>

  <ul class="list legacy-followings">
    {#each catchAllFollowings.followees as neuronId (subaccountToHexString(neuronId.id))}
      <li>
        <FollowSnsNeuronsByTopicLegacyFollowee
          nsFunction={catchAllFollowings.nsFunction}
          {neuronId}
        />
      </li>
    {/each}
  </ul>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      onclick={cancel}
    >
      {$i18n.core.cancel}
    </button>

    <button data-tid="confirm-button" class="primary" onclick={confirm}>
      {$i18n.core.confirm}
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
    @include fonts.standard(true);
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
    flex-wrap: wrap;
    gap: var(--padding);
  }
</style>
