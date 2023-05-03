<script lang="ts">
  import {
    type ProposalInfo,
    type Vote,
    votableNeurons as getVotableNeurons,
  } from "@dfinity/nns";

  import { getContext } from "svelte";
  import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
  import VotingConfirmationToolbar from "./VotingConfirmationToolbar.svelte";
  import VotingNeuronSelect from "./VotingNeuronSelect.svelte";
  import {
    SELECTED_PROPOSAL_CONTEXT_KEY,
    type SelectedProposalContext,
  } from "$lib/types/selected-proposal.context";
  import {
    isProposalDeadlineInTheFuture,
    nnsNeuronToVotingNeuron,
  } from "$lib/utils/proposals.utils";
  import {
    voteRegistrationStore,
    type VoteRegistrationStoreEntry,
  } from "$lib/stores/vote-registration.store";
  import { BottomSheet } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import { registerNnsVotes } from "$lib/services/nns-vote-registration.services";
  import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
  import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import VotingNeuronSelectList from "$lib/components/proposal-detail/VotingCard/VotingNeuronSelectList.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  export let proposalInfo: ProposalInfo;

  const votableNeurons = () =>
    getVotableNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    }).map((neuron) =>
      nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
    );

  let visible = false;
  /** Signals that the initial checkbox preselection was done. To avoid removing of user selection after second queryAndUpdate callback. */
  let initialSelectionDone = false;
  let voteRegistration: VoteRegistrationStoreEntry | undefined = undefined;

  $: voteRegistration = (
    $voteRegistrationStore.registrations[OWN_CANISTER_ID_TEXT] ?? []
  ).find(({ proposalIdString }) => `${proposalInfo.id}` === proposalIdString);

  $: $definedNeuronsStore,
    (visible =
      voteRegistration !== undefined ||
      (votableNeurons().length > 0 &&
        isProposalDeadlineInTheFuture(proposalInfo)));

  const updateVotingNeuronSelectedStore = () => {
    if (!initialSelectionDone) {
      initialSelectionDone = true;
      votingNeuronSelectStore.set(votableNeurons());
    } else {
      // preserve user selection after neurons update (e.g. queryAndUpdate second callback)
      votingNeuronSelectStore.updateNeurons(votableNeurons());
    }
  };

  $: $definedNeuronsStore, updateVotingNeuronSelectedStore();

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
      $neuronsStore.neurons !== undefined && $neuronsStore.certified === true
    );
  };

  let neuronsReady = false;
  $: $neuronsStore, (neuronsReady = neuronsStoreReady());
</script>

<BottomSheet>
  <div class="container" class:signedIn={$authSignedInStore}>
    <SignInGuard>
      {#if $definedNeuronsStore.length > 0}
        {#if neuronsReady}
          {#if visible}
            <VotingConfirmationToolbar
              {voteRegistration}
              on:nnsConfirm={vote}
            />
          {/if}

          <VotingNeuronSelect>
            <VotingNeuronSelectList disabled={voteRegistration !== undefined} />
            <MyVotes {proposalInfo} />
            <IneligibleNeuronsCard
              {proposalInfo}
              neurons={$definedNeuronsStore}
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
