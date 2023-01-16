<script lang="ts">
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { filteredProposals } from "$lib/derived/proposals.derived";
  import NoProposals from "./NoProposals.svelte";
  import LoadingProposals from "./LoadingProposals.svelte";
  import ListLoader from "./ListLoader.svelte";

  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;
</script>

<ProposalsFilters />

<ListLoader loading={loadingAnimation === "spinner"}>
  <InfiniteScroll
    on:nnsIntersect
    layout="grid"
    disabled={disableInfiniteScroll || loading}
  >
    {#each $filteredProposals.proposals as proposalInfo (proposalInfo.id)}
      <NnsProposalCard {hidden} {proposalInfo} />
    {/each}
  </InfiniteScroll>
</ListLoader>

{#if nothingFound}
  <NoProposals />
{/if}

{#if loadingAnimation === "skeleton"}
  <LoadingProposals />
{/if}
