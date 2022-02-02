<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import VotingFilters from "../lib/components/VotingFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {emptyProposals, lastProposalId, listProposals} from '../lib/utils/proposals.utils';
  import { proposalsStore } from "../lib/stores/proposals.store";
  import InfiniteScroll from "../lib/components/InfiniteScroll.svelte";

  const findProposals = async () => {
    await listProposals({ beforeProposal: lastProposalId() });
  };

  // TODO: To be removed once this page has been implemented
  onMount(async () => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/proposals");
    }

    // Load proposals on mount only if none were fetched before
    if (!emptyProposals()) {
      return;
    }

    await findProposals();
  });
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.voting.title}</h1>

      <p>{$i18n.voting.text}</p>

      <VotingFilters />

      <InfiniteScroll on:nnsIntersect={findProposals}>
        {#each $proposalsStore as { id }}
          <p>Proposal: {id}</p>
        {/each}
      </InfiniteScroll>
    </section>
  </Layout>
{/if}
