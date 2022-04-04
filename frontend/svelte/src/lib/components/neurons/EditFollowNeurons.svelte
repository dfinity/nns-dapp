<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Topic } from "@dfinity/nns";
  import FollowTopicSection from "./FollowTopicSection.svelte";
  import { i18n } from "../../stores/i18n";
  import { enumValues } from "../../utils/enum.utils";
  import { onMount } from "svelte";
  import { listKnownNeurons } from "../../services/knownNeurons.services";

  export let neuron: NeuronInfo;

  // Load KnownNeurons which are used in the FollowTopicSections
  onMount(() => listKnownNeurons());

  const topics: Topic[] = enumValues(Topic);
</script>

<div class="wizard-list" data-tid="edit-followers-screen">
  <p>{$i18n.follow_neurons.description}</p>
  <div>
    {#each topics as topic}
      <FollowTopicSection {neuron} {topic} />
    {/each}
  </div>
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: calc(1.5 * var(--padding));
  }
</style>
