<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import ProposalsFilters from "../lib/components/proposals/ProposalsFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import { emptyProposals, lastProposalId } from "../lib/utils/proposals.utils";
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
  import type { ProposalInfo } from "@dfinity/nns";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { errorToString } from "../lib/utils/error.utils";

  let loading: boolean = false;

  const findNextProposals = async () => {
    loading = true;

    try {
      await listNextProposals({
        beforeProposal: lastProposalId(proposals),
        identity: $authStore.identity,
      });
    } catch (err: any) {
      toastsStore.show({
        labelKey: "error.list_proposals",
        level: "error",
        detail: errorToString(err),
      });
      console.error(err);
    }

    loading = false;
  };

  const findProposals = async () => {
    loading = true;

    try {
      // If proposals are already displayed we reset the store first otherwise it might give the user the feeling than the new filters were already applied while the proposals are still being searched.
      await listProposals({
        clearBeforeQuery: !emptyProposals(proposals),
        identity: $authStore.identity,
      });
    } catch (err: any) {
      toastsStore.show({
        labelKey: "error.list_proposals",
        level: "error",
        detail: errorToString(err),
      });
      console.error(err);
    }

    loading = false;
  };

  let debounceFindProposals: () => void | undefined;

  // We do not want to fetch the proposals twice when the component is mounting because the filter subscriber will emit a first value
  const initDebounceFindProposals = () => {
    debounceFindProposals = debounce(async () => await findProposals(), 750);
  };

  onMount(async () => {
    // TODO: To be removed once this page has been implemented
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace(AppPath.Proposals);
    }

    // Load proposals on mount only if none were fetched before
    if (!emptyProposals(proposals)) {
      initDebounceFindProposals();
      return;
    }

    await findProposals();

    initDebounceFindProposals();
  });

  const unsubscribe: Unsubscriber = proposalsFiltersStore.subscribe(() =>
    debounceFindProposals?.()
  );

  onDestroy(unsubscribe);

  let proposals: ProposalInfo[];
  $: proposals = $proposalsStore;
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.voting.title}</h1>

      <p>{$i18n.voting.text}</p>

      <ProposalsFilters />

      <InfiniteScroll on:nnsIntersect={findNextProposals}>
        {#each $proposalsStore as proposalInfo}
          <ProposalCard {proposalInfo} />
        {/each}
      </InfiniteScroll>

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
  }
</style>
