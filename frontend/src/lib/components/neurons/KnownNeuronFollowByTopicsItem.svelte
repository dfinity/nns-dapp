<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { busy, Tooltip } from "@dfinity/gix-components";
  import type { FolloweesForTopic, KnownNeuron, Topic } from "@dfinity/nns";
  import { isNnsNeuronFollowingAllTopics } from "$lib/utils/nns-topics.utils";

  type Props = {
    knownNeuron: KnownNeuron;
    followings: FolloweesForTopic[];
    topics: Topic[];
    updateFollowings: (followeeAddress: string) => Promise<void>;
  };

  const { knownNeuron, followings, topics, updateFollowings }: Props = $props();

  const followKnownNeuron = () => updateFollowings(knownNeuron.id.toString());
  const isFollowing = $derived(
    isNnsNeuronFollowingAllTopics({
      followings,
      neuronId: knownNeuron.id,
      topics,
    })
  );
</script>

<div data-tid="known-neuron-item-component">
  <p class="value">{knownNeuron.name}</p>
  {#if isFollowing}
    <Tooltip
      id="desabled-known-neuron-follow-tooltip"
      text={$i18n.new_followee.already_followed}
    >
      <button class="primary" disabled>{$i18n.new_followee.follow}</button>
    </Tooltip>
  {:else}
    <button class="primary" disabled={$busy} onclick={followKnownNeuron}>
      {$i18n.new_followee.follow}
    </button>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  button {
    min-height: var(--padding-4x);
  }
</style>
