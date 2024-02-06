<script lang="ts">
  import type { Topic } from "@dfinity/nns";
  import { type FolloweesNeuron, getTopicTitle } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
  import { Copy, Tag } from "@dfinity/gix-components";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import { emit } from "$lib/utils/events.utils";
  import type { NnsNeuronModalVotingHistory } from "$lib/types/nns-neuron-detail.modal";

  export let followee: FolloweesNeuron;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  const topicTitle = (topic: Topic) => getTopicTitle({ topic, i18n: $i18n });
  let id: string;
  $: id = `followee-${followee.neuronId}`;
  let name: string;
  $: name =
    $knownNeuronsStore.find(({ id }) => id === followee.neuronId)?.name ??
    followee.neuronId.toString();

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  const openVotingHistory = () =>
    emit<NnsNeuronModalVotingHistory>({
      message: "nnsNeuronDetailModal",
      detail: {
        type: "voting-history",
        data: { followee, neuron: $store.neuron },
      },
    });
</script>

<TestIdWrapper testId="followee-component">
  <TagsList {id}>
    <div class="neuron" slot="title">
      <button name="title" {id} class="text" on:click={openVotingHistory}>
        {name}
      </button>
      <div class="copy">
        <Copy value={followee.neuronId.toString()} />
      </div>
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
