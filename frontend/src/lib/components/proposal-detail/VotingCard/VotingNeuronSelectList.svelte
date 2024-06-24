<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import VotingCardNeuronList from "$lib/components/proposal-detail/VotingCard/VotingCardNeuronList.svelte";
  import VotingNeuronListItem from "$lib/components/proposal-detail/VotingCard/VotingNeuronListItem.svelte";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";

  export let disabled: boolean;

  const toggleSelection = (neuronId: string) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

<TestIdWrapper testId="voting-neuron-select-list-component">
  {#if $votingNeuronSelectStore.neurons.length > 0}
    <VotingCardNeuronList>
      {#each $votingNeuronSelectStore.neurons as neuron}
        <VotingNeuronListItem {neuron} {disabled} {toggleSelection} />
      {/each}
    </VotingCardNeuronList>
  {/if}
</TestIdWrapper>
