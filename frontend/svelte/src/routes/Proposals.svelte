<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import ProposalsFilters from "../lib/components/proposals/ProposalsFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    emptyProposals,
    hasMatchingProposals,
    lastProposalId,
  } from "../lib/utils/proposals.utils";
  import {
    proposalsFiltersStore,
    proposalsStore,
  } from "../lib/stores/proposals.store";
  import InfiniteScroll from "../lib/components/ui/InfiniteScroll.svelte";
  import ProposalCard from "../lib/components/proposals/ProposalCard.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { debounce } from "../lib/utils/utils";
  import { AppPath } from "../lib/constants/routes.constants";
  import {
    listNextProposals,
    listProposals,
  } from "../lib/services/proposals.services";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";

  let loading: boolean = false;
  let initialized: boolean = false;

  const findNextProposals = async () => {
    loading = true;

    try {
      await listNextProposals({
        beforeProposal: lastProposalId($proposalsStore),
        identity: $authStore.identity,
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
      // If proposals are already displayed we reset the store first otherwise it might give the user the feeling than the new filters were already applied while the proposals are still being searched.
      await listProposals({
        clearBeforeQuery: !emptyProposals($proposalsStore),
        identity: $authStore.identity,
      });
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

  const showThisRoute = ["never", "staging"].includes(
    process.env.REDIRECT_TO_LEGACY as string
  );
  onMount(async () => {
    // TODO: To be removed once this page has been implemented
    if (!showThisRoute) {
      window.location.replace(AppPath.Proposals);
    }

    const isReferrerProposalDetail: boolean = isRoutePath({
      path: AppPath.ProposalDetail,
      routePath: $routeStore.referrerPath,
    });

    // If the previous page is the proposal detail page and if we have proposals in store, we don't reset and query the proposals after mount.
    // We do this to smoothness the back and forth navigation between this page and the detail page.
    if (!emptyProposals($proposalsStore) && isReferrerProposalDetail) {
      initDebounceFindProposals();
      return;
    }

    proposalsFiltersStore.reset();

    await findProposals();

    initDebounceFindProposals();

    initialized = true;
  });

  const unsubscribe: Unsubscriber = proposalsFiltersStore.subscribe(() =>
    debounceFindProposals?.()
  );

  onDestroy(unsubscribe);

  let nothingFound: boolean;
  $: nothingFound =
    initialized &&
    !loading &&
    !hasMatchingProposals({
      proposals: $proposalsStore,
      excludeVotedProposals: $proposalsFiltersStore.excludeVotedProposals,
    });
</script>

{#if showThisRoute}
  <Layout>
    <section>
      <p>{$i18n.voting.text}</p>

      <ProposalsFilters />

      <InfiniteScroll on:nnsIntersect={findNextProposals}>
        {#each $proposalsStore as proposalInfo}
          <ProposalCard {proposalInfo} />
        {/each}
      </InfiniteScroll>

      {#if nothingFound}
        <p class="no-proposals">{$i18n.voting.nothing_found}</p>
      {/if}

      {#if loading}
        <div class="spinner">
          <Spinner />
        </div>
      {/if}
    </section>
  </Layout>
{/if}

<style lang="scss">
  .spinner {
    position: relative;
    display: flex;

    padding: calc(2 * var(--padding)) 0;
  }

  .no-proposals {
    text-align: center;
    margin: calc(var(--padding) * 2) 0;
  }
</style>
