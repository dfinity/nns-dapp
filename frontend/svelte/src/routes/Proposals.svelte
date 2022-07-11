<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import ProposalsFilters from "../lib/components/proposals/ProposalsFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    hasMatchingProposals,
    lastProposalId,
  } from "../lib/utils/proposals.utils";
  import {
    proposalsFiltersStore,
    proposalsStore,
  } from "../lib/stores/proposals.store";
  import InfiniteScroll from "../lib/components/ui/InfiniteScroll.svelte";
  import ProposalCard from "../lib/components/proposals/ProposalCard.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { debounce } from "../lib/utils/utils";
  import { AppPath } from "../lib/constants/routes.constants";
  import {
    listNextProposals,
    listProposals,
  } from "../lib/services/proposals.services";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { routeStore } from "../lib/stores/route.store";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import {
    definedNeuronsStore,
    neuronsStore,
  } from "../lib/stores/neurons.store";
  import { reloadRouteData } from "../lib/utils/navigation.utils";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";

  let loading: boolean = false;
  let hidden: boolean = false;
  let initialized: boolean = false;

  const findNextProposals = async () => {
    loading = true;

    try {
      await listNextProposals({
        beforeProposal: lastProposalId($proposalsStore.proposals),
      });
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "error.list_proposals",
        err,
      });
    }

    loading = false;
  };

  const findProposals = async () => {
    loading = true;

    try {
      await listProposals();
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "error.list_proposals",
        err,
      });
    }

    loading = false;
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
      currentData: $proposalsStore.proposals,
    });

    if (!reload) {
      initDebounceFindProposals();
      initialized = true;
      return;
    }

    proposalsFiltersStore.reset();

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

      // Show spinner right away avoiding debounce
      loading = true;
      proposalsStore.setProposals({ proposals: [], certified: undefined });

      debounceFindProposals?.();
    }
  );

  onDestroy(unsubscribe);

  const updateNothingFound = () => {
    // Update the "nothing found" UI information only when the results of the certified query has been received to minimize UI glitches
    if ($proposalsStore.certified === false) {
      if (loading) nothingFound = false;
      return;
    }

    nothingFound =
      initialized &&
      !loading &&
      !hasMatchingProposals({
        proposals: $proposalsStore.proposals,
        filters: $proposalsFiltersStore,
        neurons: $definedNeuronsStore,
      });
  };

  let nothingFound: boolean;
  $: initialized,
    loading,
    neuronsLoaded,
    $proposalsStore,
    (() => updateNothingFound())();

  let neuronsLoaded: boolean;
  $: neuronsLoaded = $neuronsStore.neurons !== undefined;
</script>

<MainContentWrapper>
  <section data-tid="proposals-tab">
    <p>{$i18n.voting.text}</p>

    <ProposalsFilters />

    {#if neuronsLoaded}
      <InfiniteScroll on:nnsIntersect={findNextProposals}>
        {#each $proposalsStore.proposals as proposalInfo (proposalInfo.id)}
          <ProposalCard {hidden} {proposalInfo} />
        {/each}
      </InfiniteScroll>

      {#if nothingFound}
        <p class="no-proposals">{$i18n.voting.nothing_found}</p>
      {/if}
    {/if}

    {#if loading || !neuronsLoaded}
      <div class="spinner">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    {/if}
  </section>
</MainContentWrapper>

<style lang="scss">
  .spinner {
    display: flex;
    flex-direction: column;
  }

  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
