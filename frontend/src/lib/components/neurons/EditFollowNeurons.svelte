<script lang="ts">
  import FollowNnsTopicSection from "$lib/components/neurons/FollowNnsTopicSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import type { NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";

  export let neuronId: NeuronId;

  let neuron: NeuronInfo | undefined;
  $: neuron = $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId);

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(() => listKnownNeurons());

  let sortedTopics: Topic[];
  $: sortedTopics = neuron
    ? sortNnsTopics({ topics: topicsToFollow(neuron), i18n: $i18n })
    : [];
</script>

{#if neuron !== undefined}
  <div data-tid="edit-followers-screen">
    <p class="description">{$i18n.follow_neurons.description}</p>

    <Separator spacing="medium" />

    {#each sortedTopics as topic}
      <FollowNnsTopicSection {neuron} {topic} />
    {/each}
  </div>
{/if}
