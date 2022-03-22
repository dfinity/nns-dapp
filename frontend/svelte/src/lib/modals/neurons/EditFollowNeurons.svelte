<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { Topic } from "@dfinity/nns";
  import FollowTopicSection from "../../components/neurons/FollowTopicSection.svelte";
  import { i18n } from "../../stores/i18n";
  import { enumValues } from "../../utils/enum.utils";

  export let neuron: NeuronInfo;

  const topics: Topic[] = enumValues(Topic);
</script>

<section data-tid="edit-followers-screen">
  <p>{$i18n.follow_neurons.description}</p>
  <div>
    {#each topics as topic}
      <FollowTopicSection {neuron} {topic} />
    {/each}
  </div>
</section>

<style lang="scss">
  section {
    padding: 0;
  }

  div {
    margin-top: calc(2 * var(--padding));

    display: flex;
    flex-direction: column;
    gap: calc(1.5 * var(--padding));
  }
</style>
