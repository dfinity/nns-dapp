<script lang="ts">
  import {
    type ProposalInfo,
    type Vote,
    votableNeurons as getVotableNeurons,
  } from "@dfinity/nns";

  import { getContext, onDestroy } from "svelte";
  import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
  import { votingNeuronSelectStore } from "$lib/stores/proposals.store";
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
  import { BottomSheet } from "@dfinity/gix-components";
  import { Spinner } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import {isSignedIn} from "$lib/utils/auth.utils";
  import {authStore} from "$lib/stores/auth.store";

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

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

<BottomSheet>
  <div class="container" class:signedIn>
    <SignInGuard>
      {#if $definedNeuronsStore.length > 0}
        {#if neuronsReady}
          {#if visible}
            <VotingConfirmationToolbar
              {proposalInfo}
              {voteRegistration}
              on:nnsConfirm={vote}
            />
          {/if}

          <VotingNeuronSelect {proposalInfo} {voteRegistration} />
        {:else}
          <div class="loader">
            <span class="spinner"><Spinner inline size="small" /></span>
            <span> <small>{$i18n.proposal_detail.loading_neurons}</small></span>
          </div>
        {/if}
      {/if}
      <span slot="signin-cta">{$i18n.proposal_detail.sign_in}</span>
    </SignInGuard>
  </div>
</BottomSheet>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

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

  .spinner {
    display: inline-block;
    position: relative;
    vertical-align: middle;
  }
</style>
