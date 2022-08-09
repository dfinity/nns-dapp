<script lang="ts">
  import type { ProposalInfo, Vote } from "@dfinity/nns";
  import { votableNeurons as getVotableNeurons } from "@dfinity/nns";
  import { getContext, onDestroy } from "svelte";
  import { registerVotes } from "../../../services/proposals.services";
  import { i18n } from "../../../stores/i18n";
  import { definedNeuronsStore } from "../../../stores/neurons.store";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import CardInfo from "../../ui/CardInfo.svelte";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import CastVoteCardNeuronSelect from "./VotingNeuronSelect.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "../../../types/selected-proposal.context";
  import { isProposalOpenForVotes } from "../../../utils/proposals.utils";
  import {
    voteInProgressStore,
    type VoteInProgress,
  } from "../../../stores/voting.store";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = () =>
    getVotableNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });
  let visible: boolean = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  let voteInProgress: VoteInProgress | undefined = undefined;

  $: voteInProgress = $voteInProgressStore.votes.find(
    ({ proposalId }) => proposalInfo.id === proposalId
  );

  $: $definedNeuronsStore,
    (visible =
      voteInProgress !== undefined ||
      (votableNeurons().length > 0 && isProposalOpenForVotes(proposalInfo)));

  const unsubscribe = definedNeuronsStore.subscribe(() => {
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      votingNeuronSelectStore.set(votableNeurons());
    } else {
      // preserve user selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(votableNeurons());
    }
  });

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );

  const vote = async ({ detail }: { detail: { voteType: Vote } }) =>
    await registerVotes({
      neuronIds: $votingNeuronSelectStore.selectedIds,
      vote: detail.voteType,
      proposalInfo,
      reloadProposalCallback: (
        proposalInfo: ProposalInfo // we update store only if proposal id are matching even though it would be an edge case that these would not match here
      ) =>
        store.update(({ proposalId, proposal }) => ({
          proposalId,
          proposal: proposalId === proposalInfo.id ? proposalInfo : proposal,
        })),
    });

  onDestroy(() => {
    unsubscribe();
    votingNeuronSelectStore.reset();
  });
</script>

{#if visible}
  <CardInfo>
    <h3 slot="start">{$i18n.proposal_detail__vote.headline}</h3>
    <CastVoteCardNeuronSelect {proposalInfo} />
    <VotingConfirmationToolbar {proposalInfo} on:nnsConfirm={vote} />
  </CardInfo>
{/if}
