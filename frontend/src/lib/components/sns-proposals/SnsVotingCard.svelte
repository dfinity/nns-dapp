<script lang="ts">
  import { BottomSheet } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import type {
    SnsNervousSystemParameters,
    SnsNeuron,
    SnsProposalData,
    SnsVote,
  } from "@dfinity/sns";
  import { fromDefinedNullable, nonNullish } from "@dfinity/utils";
  import { sortedSnsUserNeuronsStore } from "$lib/derived/sns/sns-sorted-neurons.derived";
  import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
  import type { UniverseCanisterIdText } from "$lib/types/universe";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    voteRegistrationStore,
    type VoteRegistrationStoreEntry,
    votingNeuronSelectStore,
  } from "$lib/stores/vote-registration.store";
  import {
    snsNeuronToVotingNeuron,
    snsProposalIdString,
    snsProposalOpen,
  } from "$lib/utils/sns-proposals.utils";
  import {
    getSnsNeuronIdAsHexString,
    snsNeuronToIneligibleNeuronData,
    votableSnsNeurons,
    votedSnsNeuronDetails,
  } from "$lib/utils/sns-neuron.utils";
  import VotingConfirmationToolbar from "$lib/components/proposal-detail/VotingCard/VotingConfirmationToolbar.svelte";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import { registerSnsVotes } from "$lib/services/sns-vote-registration.services";
  import { Principal } from "@dfinity/principal";
  import VotingNeuronSelect from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelect.svelte";
  import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
  import type {
    CompactNeuronInfo,
    IneligibleNeuronData,
  } from "$lib/utils/neuron.utils";
  import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
  import { ineligibleSnsNeurons } from "$lib/utils/sns-neuron.utils";
  import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

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

  let votableNeurons: SnsNeuron[] = [];
  $: votableNeurons = votableSnsNeurons({
    proposal,
    neurons: $sortedSnsUserNeuronsStore,
  });

  let visible = false;
  $: $snsOnlyProjectStore,
    $voteRegistrationStore,
    (visible =
      voteRegistration !== undefined ||
      (votableNeurons.length > 0 && snsProposalOpen(proposal)));

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

  const votingNeurons = () =>
    nonNullish(snsParameters)
      ? votableNeurons.map((neuron) =>
          snsNeuronToVotingNeuron({
            neuron,
            snsParameters: snsParameters as SnsNervousSystemParameters,
          })
        )
      : [];
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  const updateVotingNeuronSelectedStore = () => {
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      // initially preselect all neurons
      votingNeuronSelectStore.set(votingNeurons());
    } else {
      // update checkbox selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(votingNeurons());
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

  let neuronsVotedForProposal: CompactNeuronInfo[];
  $: if (nonNullish(snsParameters) && votableNeurons.length > 0) {
    neuronsVotedForProposal = votedSnsNeuronDetails({
      neurons: $sortedSnsUserNeuronsStore,
      proposal,
      snsParameters,
    });
  }

  // ineligible neurons data
  let ineligibleNeurons: IneligibleNeuronData[];
  $: ineligibleNeurons = snsNeuronToIneligibleNeuronData({
    neurons: ineligibleSnsNeurons({
      neurons: $sortedSnsUserNeuronsStore,
      proposal,
    }),
    proposal,
  });
  let minSnsDissolveDelaySeconds: bigint;
  $: minSnsDissolveDelaySeconds =
    snsParameters === undefined
      ? 0n
      : fromDefinedNullable(
          snsParameters.neuron_minimum_dissolve_delay_to_vote_seconds
        );
</script>

<BottomSheet>
  <div class="container" class:signedIn={$authSignedInStore}>
    <SignInGuard>
      {#if $sortedSnsUserNeuronsStore.length > 0}
        {#if neuronsReady}
          {#if visible}
            <VotingConfirmationToolbar
              {voteRegistration}
              on:nnsConfirm={vote}
            />
          {/if}

          <VotingNeuronSelect>
            <VotingNeuronSelectList disabled={voteRegistration !== undefined} />
            <MyVotes {neuronsVotedForProposal} />
            <IneligibleNeuronsCard
              {ineligibleNeurons}
              {minSnsDissolveDelaySeconds}
            />
          </VotingNeuronSelect>
        {:else}
          <div class="loader">
            <SpinnerText>{$i18n.proposal_detail.loading_neurons}</SpinnerText>
          </div>
        {/if}
      {/if}
      <span slot="signin-cta">{$i18n.proposal_detail.sign_in}</span>
    </SignInGuard>
  </div>
</BottomSheet>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container:not(.signedIn) {
    display: flex;
    justify-content: center;
    padding: var(--padding-2x) 0;

    @include media.min-width(large) {
      display: block;
      padding: 0;
    }
  }

  .loader {
    // Observed values that match bottom sheet height
    padding: var(--padding-3x) var(--padding-2x);

    @include media.min-width(large) {
      padding: var(--padding-3x) 0;
    }
  }
</style>
