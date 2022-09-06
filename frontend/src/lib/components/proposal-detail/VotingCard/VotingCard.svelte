<script lang="ts">
  import {
    type ProposalInfo,
    type Vote,
    votableNeurons as getVotableNeurons,
  } from "@dfinity/nns";
  import { getContext, onDestroy, SvelteComponent } from "svelte";
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
    voteRegistrationStore,
    type VoteRegistration,
  } from "../../../stores/vote-registration.store";
  import { registerVotes } from "../../../services/vote-registration.services";
  import { VOTING_UI } from "../../../constants/environment.constants";
  import ContentCell from "../../ui/ContentCell.svelte";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = () =>
    getVotableNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });

  let visible: boolean = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  let voteRegistration: VoteRegistration | undefined = undefined;

  $: voteRegistration = $voteRegistrationStore.registrations.find(
    ({ proposalInfo: { id } }) => proposalInfo.id === id
  );

  $: $definedNeuronsStore,
    (visible =
      voteRegistration !== undefined ||
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

  // TODO(L2-965): delete legacy component <CardInfo />, inline styles (.content-cell-title and .content-cell-details) and delete ContentCell
  let cmp: typeof SvelteComponent =
    VOTING_UI === "legacy" ? CardInfo : ContentCell;
</script>

{#if visible}
  <svelte:component this={cmp}>
    <h2 slot="start">{$i18n.proposal_detail__vote.headline}</h2>
    <CastVoteCardNeuronSelect {proposalInfo} {voteRegistration} />
    <VotingConfirmationToolbar
      {proposalInfo}
      {voteRegistration}
      on:nnsConfirm={vote}
    />
  </svelte:component>
{/if}
