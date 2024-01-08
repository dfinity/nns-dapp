<script lang="ts">
  import { selectedNeuronsVotingPower } from "$lib/utils/proposals.utils";
  import { i18n } from "$lib/stores/i18n";
  import { Value } from "@dfinity/gix-components";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    type VoteRegistrationStoreEntry,
    votingNeuronSelectStore,
  } from "$lib/stores/vote-registration.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";

  export let voteRegistration: VoteRegistrationStoreEntry | undefined;

  let totalNeuronsVotingPower: bigint;
  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
  });

  let totalVotingNeurons: number;
  $: totalVotingNeurons = $votingNeuronSelectStore.neurons.length;

  let selectedVotingNeurons: number;
  $: selectedVotingNeurons = $votingNeuronSelectStore.selectedIds.length;
</script>

{#if totalVotingNeurons > 0}
  <ExpandableProposalNeurons testId="votable-neurons">
    <div slot="start" data-tid="voting-collapsible-toolbar-neurons">
      {replacePlaceholders($i18n.proposal_detail__vote.vote_with_neurons, {
        $votable_count: `${selectedVotingNeurons}`,
        $all_count: `${totalVotingNeurons}`,
      })}
    </div>
    <svelte:fragment slot="end">
      <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
      <Value testId="voting-collapsible-toolbar-voting-power"
        >{formatVotingPower(
          totalNeuronsVotingPower === undefined ? 0n : totalNeuronsVotingPower
        )}</Value
      >
    </svelte:fragment>
    <VotingNeuronSelectList disabled={voteRegistration !== undefined} />
  </ExpandableProposalNeurons>
{/if}
