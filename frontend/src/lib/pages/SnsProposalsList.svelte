<script lang="ts">
  import type { SnsProposalData } from "@dfinity/sns";
  import { i18n } from "$lib/stores/i18n";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { fromNullable } from "@dfinity/utils";

  export let proposals: SnsProposalData[] | undefined;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let disableInfiniteScroll = false;
  export let loadingNextPage = false;
</script>

<!-- TODO: Remove when implementing filters https://dfinity.atlassian.net/browse/GIX-1212 -->
<div data-tid="sns-proposals-page">
  {#if proposals === undefined}
    <div class="card-grid" data-tid="proposals-loading">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {:else if proposals.length === 0}
    <p class="description">{$i18n.voting.nothing_found}</p>
  {:else}
    <InfiniteScroll
      layout="grid"
      on:nnsIntersect
      disabled={disableInfiniteScroll}
    >
      {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
        <SnsProposalCard {proposalData} {nsFunctions} />
      {/each}
    </InfiniteScroll>
    {#if loadingNextPage}
      <div class="spinner">
        <Spinner inline />
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .spinner {
    margin: var(--padding-4x) 0 0;
  }
</style>
