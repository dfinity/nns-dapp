<script lang="ts">
  import { Topic } from "@dfinity/nns";
  import FollowTopicSection from "../../components/neurons/FollowTopicSection.svelte";
  import { i18n } from "../../stores/i18n";

  const topics: Topic[] = Object.keys(Topic)
    .filter((topic) => !isNaN(Number(topic)))
    .map((topic) => topic as unknown as Topic);
</script>

<section>
  <p>{$i18n.neurons.follow_neurons.description}</p>
  <div>
    {#each topics as topic}
      <FollowTopicSection {topic} />
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
