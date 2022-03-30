<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Topic } from "@dfinity/nns";
  import FollowTopicSection from "./FollowTopicSection.svelte";
  import { i18n } from "../../stores/i18n";
  import { enumValues } from "../../utils/enum.utils";
  import Spinner from "../ui/Spinner.svelte";

  export let neuron: NeuronInfo | undefined;

  const topics: Topic[] = enumValues(Topic);
</script>

<div class="wizard-list" data-tid="edit-followers-screen">
  {#if neuron !== undefined}
    <p>{$i18n.follow_neurons.description}</p>
    <div>
      {#each topics as topic}
        <FollowTopicSection {neuron} {topic} />
      {/each}
    </div>
  {:else}
    <Spinner />
  {/if}
</div>

<style lang="scss">
  div {
    margin-top: calc(2 * var(--padding));

    display: flex;
    flex-direction: column;
    gap: calc(1.5 * var(--padding));
  }
</style>
