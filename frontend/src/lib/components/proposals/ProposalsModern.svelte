<script lang="ts">
  import ProposalCard from "./ProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { i18n } from "../../stores/i18n";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { sortedProposals } from "../../derived/proposals.derived";

  export let neuronsLoaded: boolean;
  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;
</script>

<ProposalsFilters />

{#if neuronsLoaded}
  <InfiniteScroll
    on:nnsIntersect
    layout="grid"
    disabled={disableInfiniteScroll || loading}
  >
    {#each $sortedProposals.proposals as proposalInfo (proposalInfo.id)}
      <ProposalCard {hidden} {proposalInfo} layout="modern" />
    {/each}
  </InfiniteScroll>

  {#if loadingAnimation === "spinner"}
    <div class="spinner">
      <Spinner inline />
    </div>
  {/if}

  {#if nothingFound}
    <p class="description">{$i18n.voting.nothing_found}</p>
  {/if}
{/if}

{#if loadingAnimation === "skeleton" || !neuronsLoaded}
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
