<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import VotingFilters from "../lib/components/VotingFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import {
    emptyProposals,
    lastProposalId,
    listProposals,
  } from "../lib/utils/proposals.utils";
  import { proposalsStore } from "../lib/stores/proposals.store";
  import InfiniteScroll from "../lib/components/InfiniteScroll.svelte";
  import ProposalCard from "../lib/components/ProposalCard.svelte";
  import Spinner from "../lib/components/Spinner.svelte";

  let loading: boolean = false;

  const findProposals = async () => {
    loading = true;

    // TODO: catch error
    await listProposals({ beforeProposal: lastProposalId() });

    loading = false;
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
