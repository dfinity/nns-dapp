<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import ProposalCard from "./ProposalCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { sortedProposals } from "../../derived/proposals.derived";

  export let neuronsLoaded: boolean;
  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;

  // TODO(L2-965): delete legacy component - duplicated by the new component <ProposalsModern />
</script>

<section data-tid="proposals-tab">
  <p class="description">{$i18n.voting.text}</p>

  <ProposalsFilters />

  {#if neuronsLoaded}
    <InfiniteScroll on:nnsIntersect disabled={disableInfiniteScroll}>
      {#each $sortedProposals.proposals as proposalInfo (proposalInfo.id)}
        <ProposalCard {hidden} {proposalInfo} />
      {/each}
    </InfiniteScroll>

    {#if loadingAnimation === "spinner"}
      <div class="spinner" data-tid="proposals-spinner">
        <Spinner inline />
      </div>
    {/if}

    {#if nothingFound}
      <p class="no-proposals">{$i18n.voting.nothing_found}</p>
    {/if}
  {/if}

  {#if loadingAnimation === "skeleton" || !neuronsLoaded}
    <div class="skeleton-loading" data-tid="proposals-loading">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {/if}
</section>

<style lang="scss">
  .skeleton-loading {
    display: flex;
    flex-direction: column;
  }
  .spinner {
    margin: var(--padding-4x) 0 0;
  }

  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
