<script lang="ts">
  import VotingCard from "$lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { snsSortedNeuronStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { registerSnsVotes } from "$lib/services/sns-vote-registration.services";
  import { authStore } from "$lib/stores/auth.store";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import {
    voteRegistrationStore,
    votingNeuronSelectStore,
    type VoteRegistrationStoreEntry,
  } from "$lib/stores/vote-registration.store";
  import type { UniverseCanisterIdText } from "$lib/types/universe";
  import type {
    CompactNeuronInfo,
    IneligibleNeuronData,
  } from "$lib/utils/neuron.utils";
  import {
    getSnsNeuronIdAsHexString,
    snsNeuronsToIneligibleNeuronData,
    votableSnsNeurons,
    votedSnsNeuronDetails,
  } from "$lib/utils/sns-neuron.utils";
  import { ineligibleSnsNeurons } from "$lib/utils/sns-neuron.utils";
  import {
    snsNeuronToVotingNeuron,
    snsProposalAcceptingVotes,
    snsProposalIdString,
  } from "$lib/utils/sns-proposals.utils";
  import { Principal } from "@dfinity/principal";
  import type {
    SnsNervousSystemParameters,
    SnsNeuron,
    SnsProposalData,
    SnsVote,
  } from "@dfinity/sns";
  import { fromDefinedNullable, nonNullish } from "@dfinity/utils";

  export let proposal: SnsProposalData;
  export let reloadProposal: () => Promise<void>;

  let proposalIdString: string;
  $: proposalIdString = snsProposalIdString(proposal);

  let universeIdText: UniverseCanisterIdText | undefined;
  $: universeIdText = $snsOnlyProjectStore?.toText();

  let snsParameters: SnsNervousSystemParameters | undefined;
  $: if (nonNullish(universeIdText)) {
    snsParameters = $snsParametersStore[universeIdText]?.parameters;
  }

  let voteRegistration: VoteRegistrationStoreEntry | undefined = undefined;
  $: if (nonNullish(universeIdText)) {
    voteRegistration = (
      $voteRegistrationStore.registrations[universeIdText] ?? []
    ).find(({ proposalIdString: id }) => proposalIdString === id);
  }

  let votableNeurons: SnsNeuron[];
  $: votableNeurons = nonNullish($authStore.identity)
    ? votableSnsNeurons({
        proposal,
        neurons: $snsSortedNeuronStore,
        identity: $authStore.identity,
      })
    : [];

  let visible = false;
  $: $snsOnlyProjectStore,
    $voteRegistrationStore,
    (visible = snsProposalAcceptingVotes(proposal));

  let neuronsReady = false;
  $: neuronsReady =
    nonNullish(universeIdText) &&
    nonNullish($snsNeuronsStore[universeIdText]?.neurons);

  const userSelectedNeurons = (): SnsNeuron[] =>
    $votingNeuronSelectStore.selectedIds
      .map((id) =>
        votableNeurons.find(
          (neuron) => getSnsNeuronIdAsHexString(neuron) === id
        )
      )
      .filter(nonNullish);

  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  const updateVotingNeuronSelectedStore = () => {
    const votingNeurons = votableNeurons.map((neuron) =>
      snsNeuronToVotingNeuron({
        neuron,
        proposal,
      })
    );
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      // initially preselect all neurons
      votingNeuronSelectStore.set(votingNeurons);
    } else {
      // update checkbox selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(votingNeurons);
    }
  };

  $: votableNeurons, updateVotingNeuronSelectedStore();

  const vote = async ({ detail }: { detail: { voteType: SnsVote } }) => {
    if (nonNullish(universeIdText) && votableNeurons.length > 0) {
      await registerSnsVotes({
        universeCanisterId: Principal.from(universeIdText),
        neurons: userSelectedNeurons(),
        proposal,
        vote: detail.voteType,
        updateProposalCallback: async (updatedProposal: SnsProposalData) => {
          proposal = updatedProposal;
        },
      });
      await reloadProposal();
    }
  };

  let neuronsVotedForProposal: CompactNeuronInfo[] = [];
  $: if ($snsSortedNeuronStore.length > 0) {
    neuronsVotedForProposal = votedSnsNeuronDetails({
      neurons: $snsSortedNeuronStore,
      proposal,
    });
  }

  // ineligible neurons data
  let ineligibleNeurons: IneligibleNeuronData[];
  $: ineligibleNeurons = nonNullish($authStore.identity)
    ? snsNeuronsToIneligibleNeuronData({
        neurons: ineligibleSnsNeurons({
          neurons: $snsSortedNeuronStore,
          proposal,
          identity: $authStore.identity,
        }),
        proposal,
        identity: $authStore.identity,
      })
    : [];
  let minSnsDissolveDelaySeconds: bigint;
  $: minSnsDissolveDelaySeconds =
    snsParameters === undefined
      ? 0n
      : fromDefinedNullable(
          snsParameters.neuron_minimum_dissolve_delay_to_vote_seconds
        );

  let hasNeurons = false;
  $: hasNeurons = $snsSortedNeuronStore.length > 0;
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
