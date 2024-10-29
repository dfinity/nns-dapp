<script lang="ts">
  import VotingPowerDisplay from "$lib/components/ic/VotingPowerDisplay.svelte";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    votingNeuronSelectStore,
    type VoteRegistrationStoreEntry,
  } from "$lib/stores/vote-registration.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { selectedNeuronsVotingPower } from "$lib/utils/proposals.utils";

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
      {replacePlaceholders(
        selectedVotingNeurons > 1
          ? $i18n.proposal_detail__vote.vote_with_neurons_plural
          : $i18n.proposal_detail__vote.vote_with_neurons,
        {
          $votable_count: `${selectedVotingNeurons}`,
          $all_count: `${totalVotingNeurons}`,
        }
      )}
    </div>
    <svelte:fragment slot="end">
      <span class="label">{$i18n.proposal_detail__vote.voting_power_label}</span
      >
      <VotingPowerDisplay
        valueTestId="voting-collapsible-toolbar-voting-power"
        votingPowerE8s={totalNeuronsVotingPower}
      />
    </svelte:fragment>
    <VotingNeuronSelectList disabled={voteRegistration !== undefined} />
  </ExpandableProposalNeurons>
{/if}
