<script lang="ts">
  import type { NeuronInfo, ProposalInfo, Vote } from "@dfinity/nns";
  import { notVotedNeurons, ProposalStatus } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import { registerVotes } from "../../../services/proposals.services";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import Card from "../../ui/Card.svelte";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import CastVoteCardNeuronSelect from "./VotingNeuronSelect.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let visible: boolean = false;

  $: votingNeuronSelectStore.set(
    notVotedNeurons({
      neurons,
      proposal: proposalInfo,
    })
  );
  $: visible =
    $votingNeuronSelectStore.neurons.length > 0 &&
    proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN;

  const vote = async ({ detail }: { detail: { voteType: Vote } }) =>
    await registerVotes({
      neuronIds: $votingNeuronSelectStore.selectedIds,
      vote: detail.voteType,
      proposalId: proposalInfo.id as bigint,
    });

  onDestroy(() => votingNeuronSelectStore.reset());
</script>

{#if visible}
  <Card>
    <h3 slot="start">{$i18n.proposal_detail__vote.headline}</h3>
    <CastVoteCardNeuronSelect />
    <VotingConfirmationToolbar on:nnsConfirm={vote} />
  </Card>
{/if}
