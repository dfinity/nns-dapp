<script lang="ts">
  import { setContext } from "svelte";
  import {
    loadProposal,
    routePathProposalId,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import ProposalDetailCard from "../lib/components/proposal-detail/ProposalDetailCard/ProposalDetailCard.svelte";
  import VotesCard from "../lib/components/proposal-detail/VotesCard.svelte";
  import VotingCard from "../lib/components/proposal-detail/VotingCard/VotingCard.svelte";
  import IneligibleNeuronsCard from "../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    definedNeuronsStore,
    neuronsStore,
  } from "../lib/stores/neurons.store";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { get, writable } from "svelte/store";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import type {
    SelectedProposalContext,
    SelectedProposalStore,
  } from "../lib/types/selected-proposal.context";
  import { debugSelectedProposalStore } from "../lib/stores/debug.store";
  import type { ProposalId } from "@dfinity/nns";
  import { SELECTED_PROPOSAL_CONTEXT_KEY } from "../lib/types/selected-proposal.context";

  // Neurons are fetch on page load. No need to do it in the route.

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

  const selectedProposalStore = writable<SelectedProposalStore>({
    proposalId: undefined,
    proposal: undefined,
  });

  debugSelectedProposalStore(selectedProposalStore);

  setContext<SelectedProposalContext>(SELECTED_PROPOSAL_CONTEXT_KEY, {
    store: selectedProposalStore,
  });

  let routeProposalId: { proposalId: ProposalId | undefined } | undefined;
  $: routeProposalId = routePathProposalId($routeStore.path);

  // TODO: reload after vote $proposalsStore

  $: routeProposalId,
    (async () => {
      // Not /proposal route
      if (routeProposalId === undefined) {
        return;
      }

      // handle unknown proposalId from URL
      if (routeProposalId.proposalId === undefined) {
        goBack();
        return;
      }

      const { proposalId: storeProposalId } = $selectedProposalStore;

      if (
        storeProposalId !== routeProposalId.proposalId ||
        storeProposalId === undefined
      ) {
        // So we gonna load proposalId xxx and we set the id in store to avoid to load it multiple times
        selectedProposalStore.set({
          proposalId: routeProposalId.proposalId,
          proposal: undefined,
        });

        await loadProposal({
          proposalId: routeProposalId.proposalId,
          setProposal: (proposalInfo: ProposalInfo) => {
            // User might quickly modify proposal id url, we just want to be sure that the one to display is effectively the last one requested
            if (proposalInfo.id !== $selectedProposalStore.proposalId) {
              return;
            }

            selectedProposalStore.update(({ proposalId }) => ({
              proposalId,
              proposal: proposalInfo,
            }));
          },
          handleError: onError,
          silentUpdateErrorMessages: true,
        });
      }
    })();

  const onError = (certified: boolean) => {
    // Ignore "application payload size (X) cannot be larger than Y" error thrown by update calls
    if (certified) {
      return;
    }
    goBack();
  };

  const goBack = () => {
    const { referrerPath } = get(routeStore);
    routeStore.navigate({
      path:
        referrerPath === AppPath.Launchpad
          ? AppPath.Launchpad
          : AppPath.Proposals,
    });
  };

  layoutBackStore.set(goBack);
</script>

<MainContentWrapper>
  <section>
    {#if $selectedProposalStore.proposal !== undefined}
      <ProposalDetailCard proposalInfo={$selectedProposalStore.proposal} />

      {#if neuronsReady}
        <VotesCard proposalInfo={$selectedProposalStore.proposal} />
        <VotingCard proposalInfo={$selectedProposalStore.proposal} />
        <IneligibleNeuronsCard
          proposalInfo={$selectedProposalStore.proposal}
          neurons={$definedNeuronsStore}
        />
      {:else}
        <div class="loader">
          <SkeletonCard cardType="info" />
          <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
        </div>
      {/if}
    {:else}
      <div class="loader">
        <SkeletonCard cardType="info" />
        <span><small>{$i18n.proposal_detail.loading_neurons}</small></span>
      </div>
    {/if}
  </section>
</MainContentWrapper>

<style lang="scss">
  .loader {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: var(--padding-2x) 0;

    span {
      text-align: center;
    }
  }
</style>
