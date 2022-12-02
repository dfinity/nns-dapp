<script lang="ts">
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import type { Topic } from "@dfinity/nns";
  import FollowNnsTopicSection from "./FollowNnsTopicSection.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { onMount } from "svelte";
  import { listKnownNeurons } from "$lib/services/knownNeurons.services";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";

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
    <div>
      {#each topics as topic}
        <FollowNnsTopicSection {neuron} {topic} />
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);
  }
</style>
