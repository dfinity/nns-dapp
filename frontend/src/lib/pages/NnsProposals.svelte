<script lang="ts">
  import { onMount } from "svelte";
  import {
    hasMatchingProposals,
    lastProposalId,
  } from "$lib/utils/proposals.utils";
  import {
    type ProposalsFiltersStore,
    proposalsFiltersStore,
    proposalsStore,
  } from "$lib/stores/proposals.store";
  import { debounce } from "@dfinity/utils";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    listNextProposals,
    listProposals,
  } from "$lib/services/$public/proposals.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { reloadRouteData } from "$lib/utils/navigation.utils";
  import NnsProposalsList from "$lib/components/proposals/NnsProposalsList.svelte";
  import {
    sortedProposals,
    filteredProposals,
  } from "$lib/derived/proposals.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { listNeurons } from "$lib/services/neurons.services";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { notForceCallStrategy } from "$lib/utils/env.utils";
  import { referrerPathStore } from "$lib/stores/referrerPath.store";

  // It's exported so that we can test the value
  export let disableInfiniteScroll = false;

  $: if ($authSignedInStore) {
    listNeurons();
  }

  let loading = false;
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

  const applyFilter = ({ lastAppliedFilter }: ProposalsFiltersStore) => {
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
  };

  $: $definedNeuronsStore, applyFilter($proposalsFiltersStore);

  $: $authStore.identity, (() => proposalsFiltersStore.reload())();

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
        neurons: $definedNeuronsStore,
        identity: $authStore.identity,
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
