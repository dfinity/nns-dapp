<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import type { NeuronId, NeuronInfo, Topic } from "@dfinity/nns";
  import { onMount } from "svelte";
  import FollowNnsTopicSection from "./FollowNnsTopicSection.svelte";

  export let neuronId: NeuronId;

  let neuron: NeuronInfo | undefined;
  $: neuron = $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId);

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(() => listKnownNeurons());

  let topics: Topic[];
  $: topics = neuron ? topicsToFollow(neuron) : [];
</script>

{#if neuron !== undefined}
  <div data-tid="edit-followers-screen">
    <p class="description">{$i18n.follow_neurons.description}</p>

    <Separator spacing="medium" />

    {#each topics as topic}
      <FollowNnsTopicSection {neuron} {topic} />
    {/each}
  </div>
{/if}
