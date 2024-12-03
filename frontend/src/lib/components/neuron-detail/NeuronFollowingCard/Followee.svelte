<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
  import type { NnsNeuronModalVotingHistory } from "$lib/types/nns-neuron-detail.modal";
  import { emit } from "$lib/utils/events.utils";
  import { getTopicTitle, type FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { Copy, Tag } from "@dfinity/gix-components";
  import type { NeuronInfo, Topic } from "@dfinity/nns";

  export let followee: FolloweesNeuron;
  export let neuron: NeuronInfo | undefined;
  export let isInteractive = true;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  const topicTitle = (topic: Topic) => getTopicTitle({ topic, i18n: $i18n });
  let id: string;
  $: id = `followee-${followee.neuronId}`;
  let name: string;
  $: name =
    $knownNeuronsStore.find(({ id }) => id === followee.neuronId)?.name ??
    followee.neuronId.toString();

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
        <button name="title" {id} class="text" on:click={openVotingHistory}>
          {name}
        </button>
        <div class="copy">
          <Copy value={followee.neuronId.toString()} />
        </div>
      {:else}
        <span class="text">{name}</span>
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
