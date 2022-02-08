<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import ProposalsFilters from "../lib/components/proposals/ProposalsFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    emptyProposals,
    lastProposalId,
    listProposals,
  } from "../lib/utils/proposals.utils";
  import { proposalsStore } from "../lib/stores/proposals.store";
  import InfiniteScroll from "../lib/components/ui/InfiniteScroll.svelte";
  import ProposalCard from "../lib/components/proposals/ProposalCard.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import type { Unsubscriber } from "svelte/types/runtime/store";

  let loading: boolean = false;

  const findProposals = async () => {
    loading = true;

    // TODO: catch error
    await listProposals({ beforeProposal: lastProposalId() });

    loading = false;
  };

  onMount(async () => {
    // TODO: To be removed once this page has been implemented
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/proposals");
    }

    // Load proposals on mount only if none were fetched before
    if (!emptyProposals()) {
      return;
    }

    await findProposals();
  });

  let proposals: ProposalInfo[];

  const unsubscribe: Unsubscriber = proposalsStore.subscribe(
    ({ proposals: proposalsInfo }: ProposalInfo) => (proposals = proposalsInfo)
  );

  onDestroy(unsubscribe);
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.voting.title}</h1>

      <p>{$i18n.voting.text}</p>

      <ProposalsFilters />

      <InfiniteScroll on:nnsIntersect={findProposals}>
        {#each proposals as proposalInfo}
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
