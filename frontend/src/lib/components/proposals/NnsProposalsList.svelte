<script lang="ts">
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import NnsProposalsFilters from "./NnsProposalsFilters.svelte";
  import { filteredProposals } from "$lib/derived/proposals.derived";
  import NoProposals from "./NoProposals.svelte";
  import LoadingProposals from "./LoadingProposals.svelte";
  import ListLoader from "./ListLoader.svelte";
  import { building } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;

  // Prevent pre-rendering issue "IntersectionObserver is not defined"
  // Note: Another solution would be to lazy load the InfiniteScroll component
  let display = true;
  $: display = !building;
</script>

<TestIdWrapper testId="nns-proposal-list-component">
  <NnsProposalsFilters />

  {#if display}
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
  {/if}

  {#if nothingFound}
    <NoProposals />
  {/if}

  {#if loadingAnimation === "skeleton"}
    <LoadingProposals />
  {/if}
</TestIdWrapper>
