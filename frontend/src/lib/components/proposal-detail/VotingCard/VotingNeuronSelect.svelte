<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { votingNeuronSelectStore } from "$lib/stores/proposals.store";
  import { selectedNeuronsVotingPower } from "$lib/utils/proposals.utils";
  import { VOTING_UI } from "$lib/constants/environment.constants";
  import VotingNeuronSelectLegacy from "./VotingNeuronSelectLegacy.svelte";
  import VotingNeuronSelectModern from "./VotingNeuronSelectModern.svelte";
  import type { VoteRegistration } from "$lib/stores/vote-registration.store";

  export let proposalInfo: ProposalInfo;
  export let voteRegistration: VoteRegistration | undefined = undefined;

  let totalNeuronsVotingPower: bigint;
  let disabled: boolean = false;

  $: disabled = voteRegistration !== undefined;

  $: totalNeuronsVotingPower = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
    proposal: proposalInfo,
  });

  // TODO(L2-965): delete legacy component - VotingNeuronSelectLegacy - (and inline VotingNeuronSelectModern?)
</script>

{#if VOTING_UI === "legacy"}
  {#if $votingNeuronSelectStore.neurons.length > 0}
    <VotingNeuronSelectLegacy
      {proposalInfo}
      {disabled}
      {totalNeuronsVotingPower}
    />
  {/if}
{:else}
  <VotingNeuronSelectModern
    {proposalInfo}
    {disabled}
    {totalNeuronsVotingPower}
  />
{/if}
