<script lang="ts">
  import {
    type ProposalInfo,
    type Vote,
    votableNeurons as getVotableNeurons,
  } from "@dfinity/nns";

  import { getContext, onDestroy } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { votingNeuronSelectStore } from "$lib/stores/proposals.store";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import VotingNeuronSelect from "./VotingNeuronSelect.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import { isProposalDeadlineInTheFuture } from "$lib/utils/proposals.utils";
  import {
    voteRegistrationStore,
    type VoteRegistration,
  } from "$lib/stores/vote-registration.store";
  import { registerVotes } from "$lib/services/vote-registration.services";
  import { VOTING_UI } from "$lib/constants/environment.constants";
  import { BottomSheet } from "@dfinity/gix-components";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = () =>
    getVotableNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });

  let visible = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  let voteRegistration: VoteRegistration | undefined = undefined;

  $: voteRegistration = $voteRegistrationStore.registrations.find(
    ({ proposalInfo: { id } }) => proposalInfo.id === id
  );

  $: $definedNeuronsStore,
    (visible =
      voteRegistration !== undefined ||
      (votableNeurons().length > 0 &&
        isProposalDeadlineInTheFuture(proposalInfo)));

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

  // TODO(L2-965): delete legacy component <CardInfo />
</script>

{#if VOTING_UI === "legacy"}
  {#if visible}
    <CardInfo>
      <h2 slot="start">{$i18n.proposal_detail__vote.headline}</h2>
      <VotingNeuronSelect {proposalInfo} {voteRegistration} />
      <VotingConfirmationToolbar
        {proposalInfo}
        {voteRegistration}
        on:nnsConfirm={vote}
        layout="legacy"
      />
    </CardInfo>
  {/if}
{:else if $definedNeuronsStore.length > 0}
  <BottomSheet>
    {#if visible}
      <VotingConfirmationToolbar
        {proposalInfo}
        {voteRegistration}
        on:nnsConfirm={vote}
        layout="modern"
      />
    {/if}

    <VotingNeuronSelect {proposalInfo} {voteRegistration} />
  </BottomSheet>
{/if}
