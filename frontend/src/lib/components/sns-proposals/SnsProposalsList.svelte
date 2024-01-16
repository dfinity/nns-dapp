<script lang="ts">
  import type { SnsProposalData } from "@dfinity/sns";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { fromNullable } from "@dfinity/utils";
  import NoProposals from "../proposals/NoProposals.svelte";
  import LoadingProposals from "../proposals/LoadingProposals.svelte";
  import ListLoader from "../proposals/ListLoader.svelte";
  import SnsProposalsFilters from "./SnsProposalsFilters.svelte";

  export let proposals: SnsProposalData[] | undefined;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let disableInfiniteScroll = false;
  export let loadingNextPage = false;
</script>

<SnsProposalsFilters />
{#if proposals === undefined}
  <LoadingProposals />
{:else if proposals.length === 0}
  <NoProposals />
{:else}
  <ListLoader loading={loadingNextPage}>
    <InfiniteScroll
      layout="grid"
      on:nnsIntersect
      disabled={disableInfiniteScroll}
    >
      {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
        <SnsProposalCard {proposalData} {nsFunctions} />
      {/each}
    </InfiniteScroll>
  </ListLoader>
{/if}
