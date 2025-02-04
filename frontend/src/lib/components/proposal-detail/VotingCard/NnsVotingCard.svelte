<script lang="ts">
  import VotingCard from "$lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { registerNnsVotes } from "$lib/services/nns-vote-registration.services";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import {
    voteRegistrationStore,
    type VoteRegistrationStoreEntry,
  } from "$lib/stores/vote-registration.store";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import { isForceCallStrategy } from "$lib/utils/call.utils";
  import {
    filterIneligibleNnsNeurons,
    votedNeuronDetails,
    type CompactNeuronInfo,
    type IneligibleNeuronData,
  } from "$lib/utils/neuron.utils";
  import {
    isProposalDeadlineInTheFuture,
    nnsNeuronToVotingNeuron,
  } from "$lib/utils/proposals.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    votableNeurons as getVotableNeurons,
    type ProposalInfo,
    type Vote,
  } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = ({
    neurons,
    proposal,
  }: {
    neurons: NeuronInfo[];
    proposal: ProposalInfo;
  }) =>
    getVotableNeurons({
      neurons,
      proposal,
    }).map((neuron) => nnsNeuronToVotingNeuron({ neuron, proposal }));

  let visible = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  let voteRegistration: VoteRegistrationStoreEntry | undefined = undefined;

  $: voteRegistration = (
    $voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
  ).find(({ proposalIdString }) => `${proposalInfo.id}` === proposalIdString);

  $: $definedNeuronsStore,
    (visible = isProposalDeadlineInTheFuture(proposalInfo));

  const updateVotingNeuronSelectedStore = ({
    neurons,
    proposal,
  }: {
    neurons: NeuronInfo[];
    proposal: ProposalInfo;
  }) => {
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      votingNeuronSelectStore.set(
        votableNeurons({
          neurons,
          proposal,
        })
      );
    } else {
      // preserve user selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(
        votableNeurons({
          neurons,
          proposal,
        })
      );
    }
  };

  $: updateVotingNeuronSelectedStore({
    neurons: $definedNeuronsStore,
    proposal: proposalInfo,
  });

  const { store } = getContext<SelectedProposalContext>(
    SELECTED_PROPOSAL_CONTEXT_KEY
  );
  const vote = async ({ detail }: { detail: { voteType: Vote } }) =>
    await registerNnsVotes({
      neuronIds: $votingNeuronSelectStore.selectedIds.map(BigInt),
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

  // UI loader
  const neuronsStoreReady = (): boolean => {
    // We consider the neurons store as ready if it has been initialized once. Subsequent changes that happen after vote or other functions are handled with the busy store.
    // This to avoid the display of a spinner within the page and another spinner over it (the busy spinner) when the user vote is being processed.
    if (neuronsReady) {
      return true;
    }

    return (
      $neuronsStore.neurons !== undefined &&
      ($neuronsStore.certified === true ||
        ($neuronsStore.certified === false && isForceCallStrategy()))
    );
  };

  let neuronsReady = false;
  $: $neuronsStore, (neuronsReady = neuronsStoreReady());

  let neuronsVotedForProposal: CompactNeuronInfo[];
  $: {
    neuronsVotedForProposal = votedNeuronDetails({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });
  }

  let ineligibleNeurons: IneligibleNeuronData[];
  $: ineligibleNeurons = filterIneligibleNnsNeurons({
    neurons: $definedNeuronsStore,
    proposal: proposalInfo,
  });

  let hasNeurons = false;
  $: hasNeurons = $definedNeuronsStore.length > 0;

  let minSnsDissolveDelaySeconds: bigint;
  $: minSnsDissolveDelaySeconds = BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE);
</script>

<VotingCard
  {hasNeurons}
  {visible}
  {neuronsReady}
  {voteRegistration}
  {neuronsVotedForProposal}
  {ineligibleNeurons}
  {minSnsDissolveDelaySeconds}
  on:nnsConfirm={vote}
/>
