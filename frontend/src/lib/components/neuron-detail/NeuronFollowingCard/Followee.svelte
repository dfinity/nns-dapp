<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Copy from "$lib/components/ui/Copy.svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
  import type { NnsNeuronModalVotingHistory } from "$lib/types/nns-neuron-detail.modal";
  import { emit } from "$lib/utils/events.utils";
  import { getTopicTitle, type FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { Tag } from "@dfinity/gix-components";
  import type { NeuronInfo, Topic } from "@icp-sdk/canisters/nns";

  type Props = {
    followee: FolloweesNeuron;
    neuron: NeuronInfo;
    isInteractive?: boolean;
  };
  const { followee, neuron, isInteractive = true }: Props = $props();

  const id = $derived(`followee-${followee.neuronId}`);
  let name = $derived(
    $knownNeuronsStore.find(({ id }) => id === followee.neuronId)?.name ??
      followee.neuronId.toString()
  );

  // TODO: Align with `en.governance.json` "topics.[topic]"
  const topicTitle = (topic: Topic) => getTopicTitle({ topic, i18n: $i18n });

  const openVotingHistory = () =>
    emit<NnsNeuronModalVotingHistory>({
      message: "nnsNeuronDetailModal",
      detail: {
        type: "voting-history",
        data: { followee, neuron },
      },
    });
</script>

<TestIdWrapper testId="followee-component">
  <TagsList {id}>
    <div class="neuron" slot="title">
      {#if isInteractive}
        <button
          data-tid="title"
          name="title"
          {id}
          class="text"
          onclick={openVotingHistory}
        >
          {name}
        </button>
        <div class="copy">
          <Copy value={followee.neuronId.toString()} />
        </div>
      {:else}
        <span data-tid="title" class="text">{name}</span>
      {/if}
    </div>

    {#each followee.topics as topic}
      <Tag tagName="li">{topicTitle(topic)}</Tag>
    {/each}
  </TagsList>
</TestIdWrapper>

<style lang="scss">
  .neuron {
    align-items: center;
    display: inline-flex;

    .copy {
      align-items: center;
      display: inline-flex;
      // Make sure the icon doesn't increase the line height.
      max-height: 0;
    }
  }
</style>
