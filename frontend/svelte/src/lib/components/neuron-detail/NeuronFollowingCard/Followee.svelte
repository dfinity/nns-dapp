<script lang="ts">
  import type { Topic } from "@dfinity/nns";
  import type { FolloweesNeuron } from "../../../utils/neuron.utils";
  import { i18n } from "../../../stores/i18n";
  import VotingHistoryModal from "../../../modals/neurons/VotingHistoryModal.svelte";
  import { knownNeuronsStore } from "../../../stores/knownNeurons.store";

  export let followee: FolloweesNeuron;

  const topicTitle = (topic: Topic) =>
    $i18n.follow_neurons[`topic_${topic}_title`];

  let modalOpen = false;
  let id: string;
  $: id = `followee-${followee.neuronId}`;
  let name: string;
  $: name =
    $knownNeuronsStore.find(({ id }) => id === followee.neuronId)?.name ??
    followee.neuronId.toString();
</script>

<button {id} class="text" on:click|stopPropagation={() => (modalOpen = true)}>
  {name}
</button>

<ul aria-labelledby={id}>
  {#each followee.topics as topic}
    <li>{topicTitle(topic)}</li>
  {/each}
</ul>

{#if modalOpen}
  <VotingHistoryModal
    neuronId={followee.neuronId}
    on:nnsClose={() => (modalOpen = false)}
  />
{/if}

<style lang="scss">
  button {
    margin: 0 0 calc(0.5 * var(--padding));
    font-size: var(--font-size-h5);
  }

  ul {
    display: flex;
    gap: calc(0.5 * var(--padding));
    flex-wrap: wrap;

    list-style: none;

    margin-bottom: var(--padding);
    padding: 0 0 calc(2 * var(--padding));
    border-bottom: 1px solid currentColor;
  }

  li {
    display: inline-block;
    padding: calc(0.5 * var(--padding)) var(--padding);

    color: var(--primary);
    border: 1px solid var(--primary);
    border-radius: var(--border-radius-5x);
  }
</style>
