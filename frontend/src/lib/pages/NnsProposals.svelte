<script lang="ts">
  import NnsProposalsList from "$lib/components/proposals/NnsProposalsList.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { sortedProposals } from "$lib/derived/proposals.derived";
  import {
    listNextProposals,
    listProposals,
  } from "$lib/services/public/proposals.services";
  import {
    proposalsFiltersStore,
    proposalsStore,
  } from "$lib/stores/proposals.store";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { reloadRouteData } from "$lib/utils/navigation.utils";
  import { lastProposalId } from "$lib/utils/proposals.utils";
  import { debounce } from "@dfinity/utils";
  import { onMount } from "svelte";

  // It's exported so that we can test the value
  export let disableInfiniteScroll = false;

  let loading = true;
  let hidden = false;
  let initialized = false;

  // Used to determine if a request is still the most recent request when its
  // response comes back.
  let lastProposalsRequestToken: object = {};

  const loadFinished = ({ paginationOver }: { paginationOver: boolean }) => {
    disableInfiniteScroll = paginationOver;
  };

  const loadError = (err: unknown) => {
    disableInfiniteScroll = true;

    toastsError({
      labelKey: "error.list_proposals",
      err,
    });
  };

  const wrapProposalLoading = async (promise: Promise<void>) => {
    const proposalsRequestToken = {};
    lastProposalsRequestToken = proposalsRequestToken;
    loading = true;

    try {
      await promise;
    } catch (err: unknown) {
      loadError(err);
    } finally {
      // Only reset loading if there isn't a newer request in flight.
      if (lastProposalsRequestToken === proposalsRequestToken) {
        loading = false;
      }
    }
  };

  const findNextProposals = () =>
    wrapProposalLoading(
      listNextProposals({
        beforeProposal: lastProposalId($sortedProposals.proposals),
        loadFinished,
      })
    );

  const findProposals = () =>
    wrapProposalLoading(listProposals({ loadFinished }));

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
    const mutableProposalsStore =
      proposalsStore.getSingleMutationProposalsStore();
    mutableProposalsStore.set({
      // This `certified` is what the subscriber of the store sees.
      data: { proposals: [], certified: undefined },
      // This `certified` indicates that the store mutation is final.
      certified: true,
    });

    debounceFindProposals?.();
  };

  $: $proposalsFiltersStore, applyFilter();

  let loadingAnimation: "spinner" | "skeleton" | undefined = undefined;
  $: loadingAnimation = !loading
    ? undefined
    : $sortedProposals.proposals.length > 0
      ? "spinner"
      : "skeleton";
</script>

<NnsProposalsList
  {hidden}
  {disableInfiniteScroll}
  {loading}
  {loadingAnimation}
  on:nnsIntersect={findNextProposals}
/>
