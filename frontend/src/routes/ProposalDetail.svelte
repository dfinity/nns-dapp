<script lang="ts">
  import { setContext } from "svelte";
  import {
    loadProposal,
    routePathProposalId,
  } from "../lib/services/proposals.services";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import { neuronsStore } from "../lib/stores/neurons.store";
  import { layoutBackStore } from "../lib/stores/layout.store";
  import { get, writable } from "svelte/store";
  import type {
    SelectedProposalContext,
    SelectedProposalStore,
  } from "../lib/types/selected-proposal.context";
  import { debugSelectedProposalStore } from "../lib/stores/debug.store";
  import type { ProposalId } from "@dfinity/nns";
  import { SELECTED_PROPOSAL_CONTEXT_KEY } from "../lib/types/selected-proposal.context";
  import { VOTING_UI } from "../lib/constants/environment.constants";
  import ProposalLegacy from "../lib/components/proposal-detail/ProposalLegacy.svelte";
  import ProposalModern from "../lib/components/proposal-detail/ProposalModern.svelte";

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

<main class={VOTING_UI}>
  {#if VOTING_UI === "modern"}
    <ProposalModern {neuronsReady} />
  {:else}
    <ProposalLegacy {neuronsReady} />
  {/if}
</main>
