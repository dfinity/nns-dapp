<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import { selectedNeuronsVotingPower } from "../../../utils/proposals.utils";
  import type { VoteInProgress } from "../../../stores/voting.store";
  import { VOTING_UI } from "../../../constants/environment.constants";
  import VotingNeuronSelectLegacy from "./VotingNeuronSelectLegacy.svelte";
  import VotingNeuronSelectModern from "./VotingNeuronSelectModern.svelte";

  export let proposalInfo: ProposalInfo;
  export let voteInProgress: VoteInProgress | undefined = undefined;

  let totalNeuronsVotingPower: bigint;
  let disabled: boolean = false;

  $: disabled = voteInProgress !== undefined;

  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
    proposal: proposalInfo,
  });

  // TODO(L2-965): delete legacy component - VotingNeuronSelectLegacy - (and inline VotingNeuronSelectModern?)
</script>

{#if $votingNeuronSelectStore.neurons.length > 0}
  {#if VOTING_UI === "legacy"}
    <VotingNeuronSelectLegacy
      {proposalInfo}
      {disabled}
      {totalNeuronsVotingPower}
    />
  {:else}
    <VotingNeuronSelectModern
      {proposalInfo}
      {disabled}
      {totalNeuronsVotingPower}
    />
  {/if}
{/if}
