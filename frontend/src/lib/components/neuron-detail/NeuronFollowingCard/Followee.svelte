<script lang="ts">
  import type { Topic } from "@dfinity/nns";
  import type { FolloweesNeuron } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/knownNeurons.store";
  import { Tag } from "@dfinity/gix-components";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import {emit} from "$lib/utils/events.utils";
  import type {NnsNeuronModalVotingHistory} from "$lib/types/nns-neuron-detail.modal";

  export let followee: FolloweesNeuron;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  const topicTitle = (topic: Topic) =>
    $i18n.follow_neurons[`topic_${topic}_title`];

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
      detail: { type: "voting-history", data: { followee, neuron: $store.neuron } },
    });
</script>

<TagsList {id} on:nnsTitleClick={openVotingHistory}>
  <svelte:fragment slot="title">
    {name}
  </svelte:fragment>

  {#each followee.topics as topic}
    <Tag tagName="li">{topicTitle(topic)}</Tag>
  {/each}
</TagsList>
