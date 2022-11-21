<script lang="ts">
  import ProposalCard from "./ProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { filteredProposals } from "$lib/derived/proposals.derived";

  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;
</script>

<ProposalsFilters />

<InfiniteScroll
  on:nnsIntersect
  layout="grid"
  disabled={disableInfiniteScroll || loading}
>
  {#each $filteredProposals.proposals as proposalInfo (proposalInfo.id)}
    <ProposalCard {hidden} {proposalInfo} />
  {/each}
</InfiniteScroll>

{#if loadingAnimation === "spinner"}
  <div class="spinner" data-tid="proposals-spinner">
    <Spinner inline />
  </div>
{/if}

{#if nothingFound}
  <p class="description">{$i18n.voting.nothing_found}</p>
{/if}

{#if loadingAnimation === "skeleton"}
  <div class="card-grid" data-tid="proposals-loading">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
{/if}

<style lang="scss">
  .spinner {
    margin: var(--padding-4x) 0 0;
  }
</style>
