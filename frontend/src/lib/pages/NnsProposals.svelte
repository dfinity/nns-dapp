<script lang="ts">
  import NnsProposalsList from "$lib/components/proposals/NnsProposalsList.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import {
    sortedProposals,
    filteredProposals,
  } from "$lib/derived/proposals.derived";
  import {
    listNextProposals,
    listProposals,
  } from "$lib/services/$public/proposals.services";
  import { listNeurons } from "$lib/services/neurons.services";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import {
    proposalsFiltersStore,
    proposalsStore,
  } from "$lib/stores/proposals.store";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { notForceCallStrategy } from "$lib/utils/env.utils";
  import { reloadRouteData } from "$lib/utils/navigation.utils";
  import {
    hasMatchingProposals,
    lastProposalId,
  } from "$lib/utils/proposals.utils";
  import { debounce } from "@dfinity/utils";
  import { onMount } from "svelte";

  // It's exported so that we can test the value
  export let disableInfiniteScroll = false;

  $: if ($authSignedInStore) {
    listNeurons();
  }

  let loading = true;
  let hidden = false;
  let initialized = false;

  const loadFinished = ({ paginationOver }: { paginationOver: boolean }) => {
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
    const reload = reloadRouteData({
      expectedPreviousPath: AppPath.Proposal,
      effectivePreviousPath: $referrerPathStore,
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

  const applyFilter = () => {
    // We only want to display spinner and reset the proposals store if filters are modified by the user
    if (!initialized) {
      return;
    }

    // We are about to fetch again, we can enable the infinite scroll observer again in case it was disabled because we would have fetched all proposals previously
    disableInfiniteScroll = false;

    // Show spinner right away avoiding debounce
    loading = true;
    proposalsStore.setProposals({ proposals: [], certified: undefined });

    debounceFindProposals?.();
  };

  // Neurons and proposals are loaded at the same time. But once neurons are
  // loaded, proposals are loaded again. So it's possible that the component
  // goes back into loading state immediately after proposals are loaded.
  // TODO: Fix NnsProposals to load proposals only once and remove the
  // work-around from NnsProposalList.page-object.ts
  $: $definedNeuronsStore, $proposalsFiltersStore, applyFilter();

  const updateNothingFound = () => {
    // Update the "nothing found" UI information only when the results of the certified query has been received to minimize UI glitches
    if ($filteredProposals.certified === false && notForceCallStrategy()) {
      if (loading) nothingFound = false;
      return;
    }

    nothingFound =
      initialized &&
      !loading &&
      !hasMatchingProposals({
        proposals: $filteredProposals.proposals,
        filters: $proposalsFiltersStore,
      });
  };

  let nothingFound: boolean;
  $: initialized, loading, $filteredProposals, (() => updateNothingFound())();

  let loadingAnimation: "spinner" | "skeleton" | undefined = undefined;
  $: loadingAnimation = !loading
    ? undefined
    : $sortedProposals.proposals.length > 0
    ? "spinner"
    : "skeleton";
</script>

<NnsProposalsList
  {hidden}
  {nothingFound}
  {disableInfiniteScroll}
  {loading}
  {loadingAnimation}
  on:nnsIntersect={findNextProposals}
/>
