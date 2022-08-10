<script lang="ts">
  import { proposalsStore } from "../../stores/proposals.store";
  import ProposalCard from "./ProposalCard.svelte";
  import InfiniteScroll from "../ui/InfiniteScroll.svelte";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import CardGrid from "../ui/CardGrid.svelte";

  export let neuronsLoaded: boolean;
  export let loading: boolean;
  export let nothingFound: boolean;
  export let hidden: boolean;
</script>

<ProposalsFilters />

{#if neuronsLoaded}
  <InfiniteScroll on:nnsIntersect>
    {#each $proposalsStore.proposals as proposalInfo (proposalInfo.id)}
      <ProposalCard {hidden} {proposalInfo} />
    {/each}
  </InfiniteScroll>

  {#if nothingFound}
    <p>{$i18n.voting.nothing_found}</p>
  {/if}
{/if}

{#if loading || !neuronsLoaded}
  <CardGrid>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </CardGrid>
{/if}
