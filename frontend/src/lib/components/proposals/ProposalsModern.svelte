<script lang="ts">
  import { proposalsStore } from "../../stores/proposals.store";
  import ProposalCard from "./ProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";

  export let neuronsLoaded: boolean;
  export let loading: boolean;
  export let nothingFound: boolean;
  export let hidden: boolean;
</script>

<ProposalsFilters />

{#if neuronsLoaded}
  <InfiniteScroll on:nnsIntersect layout="grid">
    {#each $proposalsStore.proposals as proposalInfo (proposalInfo.id)}
      <ProposalCard {hidden} {proposalInfo} layout="modern" />
    {/each}
  </InfiniteScroll>

  {#if nothingFound}
    <p>{$i18n.voting.nothing_found}</p>
  {/if}
{/if}

{#if loading || !neuronsLoaded}
  <div class="card-grid" data-tid="proposals-loading">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
{/if}
