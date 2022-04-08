<script lang="ts">
  import { Topic } from "@dfinity/nns";
  import type { FolloweesNeuron } from "../../../utils/neuron.utils";
  import { i18n } from "../../../stores/i18n";
  import VotingHistoryModal from "../../../modals/neurons/VotingHistoryModal.svelte";

  export let followee: FolloweesNeuron;
  let modalOpen = false;
</script>

<button class="text" on:click|stopPropagation={() => (modalOpen = true)}>
  {followee.neuronId}
</button>

<ul>
  {#each followee.topics as topic}
    <li>{$i18n.topics[Topic[topic]]}</li>
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
  }

  ul {
    display: flex;
    gap: var(--padding);
    flex-wrap: wrap;

    list-style: none;

    margin-bottom: var(--padding);
    padding: 0 0 calc(2 * var(--padding));
    border-bottom: 1px solid var(--gray-600);

    &:last-of-type {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  li {
    display: inline-block;
    padding: calc(0.5 * var(--padding)) var(--padding);

    color: var(--brand-sea-buckthorn);
    border: 1px solid var(--brand-sea-buckthorn);
    border-radius: var(--border-radius);
  }
</style>
