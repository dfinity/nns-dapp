<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    hasMatchingProposals,
    lastProposalId,
  } from "../utils/proposals.utils";
  import {
    proposalsFiltersStore,
    proposalsStore,
  } from "../stores/proposals.store";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { debounce } from "../utils/utils";
  import { AppPath } from "../constants/routes.constants";
  import {
    listNextProposals,
    listProposals,
  } from "../services/proposals.services";
  import { toastsError } from "../stores/toasts.store";
  import { routeStore } from "../stores/route.store";
  import {
    definedNeuronsStore,
    neuronsStore,
  } from "../stores/neurons.store";
  import { reloadRouteData } from "../utils/navigation.utils";
  import ProposalsLegacy from "../components/proposals/ProposalsLegacy.svelte";
  import ProposalsModern from "../components/proposals/ProposalsModern.svelte";
  import { VOTING_UI } from "../constants/environment.constants";
  import {
    sortedProposals,
    filteredProposals,
  } from "../derived/proposals.derived";

  let loading: boolean = false;
  let hidden: boolean = false;
  let initialized: boolean = false;
  let disableInfiniteScroll: boolean = false;

  const loadFinished = ({ paginationOver }) => {
    loading = false;
    disableInfiniteScroll = paginationOver;
  };

  const loadError = (err: unknown) => {
    loading = false;
    disableInfiniteScroll = true;

    toastsError({
      labelKey: "error.list_proposals",
      err,
    });
  };

  const findNextProposals = async () => {
    loading = true;

    try {
      await listNextProposals({
        beforeProposal: lastProposalId($sortedProposals.proposals),
        loadFinished,
      });
    } catch (err: unknown) {
      loadError(err);
    }
  };

  const findProposals = async () => {
    loading = true;

    try {
      await listProposals({ loadFinished });
    } catch (err: unknown) {
      loadError(err);
    }
  };

  let debounceFindProposals: () => void | undefined;

  // We do not want to fetch the proposals twice when the component is mounting because the filter subscriber will emit a first value
  const initDebounceFindProposals = () => {
    debounceFindProposals = debounce(async () => await findProposals(), 250);
  };

  onMount(async () => {
    const reload: boolean = reloadRouteData({
      expectedPreviousPath: AppPath.ProposalDetail,
      effectivePreviousPath: $routeStore.referrerPath,
      currentData: $sortedProposals.proposals,
    });

    if (!reload) {
      initDebounceFindProposals();
      initialized = true;
      return;
    }

    await findProposals();

    initDebounceFindProposals();

    initialized = true;
  });

  const unsubscribe: Unsubscriber = proposalsFiltersStore.subscribe(
    ({ lastAppliedFilter }) => {
      // We only want to display spinner and reset the proposals store if filters are modified by the user
      if (!initialized) {
        return;
      }

      if (lastAppliedFilter === "excludeVotedProposals") {
        // Make a visual feedback that the filter was applyed
        hidden = true;
        setTimeout(() => (hidden = false), 200);
        return;
      }

      // We are about to fetch again, we can enable the infinite scroll observer again in case it was disabled because we would have fetched all proposals previously
      disableInfiniteScroll = false;

      // Show spinner right away avoiding debounce
      loading = true;
      proposalsStore.setProposals({ proposals: [], certified: undefined });

      debounceFindProposals?.();
    }
  );

  onDestroy(unsubscribe);

  const updateNothingFound = () => {
    // Update the "nothing found" UI information only when the results of the certified query has been received to minimize UI glitches
    if ($filteredProposals.certified === false) {
      if (loading) nothingFound = false;
      return;
    }

    nothingFound =
      initialized &&
      !loading &&
      !hasMatchingProposals({
        proposals: $filteredProposals.proposals,
        filters: $proposalsFiltersStore,
        neurons: $definedNeuronsStore,
      });
  };

  let nothingFound: boolean;
  $: initialized,
    loading,
    neuronsLoaded,
    $filteredProposals,
    (() => updateNothingFound())();

  let neuronsLoaded: boolean;
  $: neuronsLoaded = $neuronsStore.neurons !== undefined;

  let loadingAnimation: "spinner" | "skeleton" | undefined = undefined;
  $: loadingAnimation = !loading
    ? undefined
    : $sortedProposals.proposals.length > 0
    ? "spinner"
    : "skeleton";
</script>

<main
  class={VOTING_UI}
  data-tid={`proposals-scroll-${disableInfiniteScroll ? "off" : "on"}`}
>
  {#if VOTING_UI === "modern"}
    <ProposalsModern
      {hidden}
      {neuronsLoaded}
      {nothingFound}
      {disableInfiniteScroll}
      {loading}
      {loadingAnimation}
      on:nnsIntersect={findNextProposals}
    />
  {:else}
    <ProposalsLegacy
      {hidden}
      {neuronsLoaded}
      {nothingFound}
      {disableInfiniteScroll}
      {loadingAnimation}
      on:nnsIntersect={findNextProposals}
    />
  {/if}
</main>
