<script lang="ts">
  import FollowNnsTopicSection from "$lib/components/neurons/FollowNnsTopicSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";
  import type { NeuronId } from "@icp-sdk/canisters/nns";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";

  type Props = {
    neuronId: NeuronId;
  };
  const { neuronId }: Props = $props();

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(listKnownNeurons);

  const neuron = $derived(
    $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId)
  );
  const sortedTopics = $derived(
    neuron ? sortNnsTopics({ topics: topicsToFollow(neuron), i18n: $i18n }) : []
  );
</script>

{#if nonNullish(neuron)}
  <div data-tid="edit-followers-screen">
    <p class="description">{$i18n.follow_neurons.description}</p>

    <Separator spacing="medium" />

    {#each sortedTopics as topic}
      <FollowNnsTopicSection {neuron} {topic} />
    {/each}
  </div>
{/if}
