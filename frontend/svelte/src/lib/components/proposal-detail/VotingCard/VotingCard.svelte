<script lang="ts">
  import type { ProposalInfo, Vote } from "@dfinity/nns";
  import {
    votableNeurons as getVotableNeurons,
    ProposalStatus,
  } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import { registerVotes } from "../../../services/proposals.services";
  import { i18n } from "../../../stores/i18n";
  import { definedNeuronsStore } from "../../../stores/neurons.store";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import CardStatic from "../../ui/CardStatic.svelte";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import CastVoteCardNeuronSelect from "./VotingNeuronSelect.svelte";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = () =>
    getVotableNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });
  let visible: boolean = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;

  $: $definedNeuronsStore,
    (visible =
      votableNeurons().length > 0 &&
      proposalInfo.status === ProposalStatus.PROPOSAL_STATUS_OPEN);

  const unsubscribe = definedNeuronsStore.subscribe(() => {
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      votingNeuronSelectStore.set(votableNeurons());
    } else {
      // preserve user selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(votableNeurons());
    }
  });
  const vote = async ({ detail }: { detail: { voteType: Vote } }) =>
    await registerVotes({
      neuronIds: $votingNeuronSelectStore.selectedIds,
      vote: detail.voteType,
      proposalId: proposalInfo.id as bigint,
    });

  onDestroy(() => {
    unsubscribe();
    votingNeuronSelectStore.reset();
  });
</script>

{#if visible}
  <CardStatic>
    <h3 slot="start">{$i18n.proposal_detail__vote.headline}</h3>
    <CastVoteCardNeuronSelect {proposalInfo} />
    <VotingConfirmationToolbar {proposalInfo} on:nnsConfirm={vote} />
  </CardStatic>
{/if}
