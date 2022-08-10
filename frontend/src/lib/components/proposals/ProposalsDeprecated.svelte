<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import ProposalsFilters from "./ProposalsFilters.svelte";
  import InfiniteScroll from "../ui/InfiniteScroll.svelte";
  import ProposalCard from "./ProposalCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import { proposalsStore } from "../../stores/proposals.store";

  export let neuronsLoaded: boolean;
  export let loading: boolean;
  export let nothingFound: boolean;
  export let hidden: boolean;
</script>

<section data-tid="proposals-tab">
  <p class="description">{$i18n.voting.text}</p>

  <ProposalsFilters />

  {#if neuronsLoaded}
    <InfiniteScroll on:nnsIntersect>
      {#each $proposalsStore.proposals as proposalInfo (proposalInfo.id)}
        <ProposalCard {hidden} {proposalInfo} />
      {/each}
    </InfiniteScroll>

    {#if nothingFound}
      <p class="no-proposals">{$i18n.voting.nothing_found}</p>
    {/if}
  {/if}

  {#if loading || !neuronsLoaded}
    <div class="spinner">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  {/if}
</section>

<style lang="scss">
  .spinner {
    display: flex;
    flex-direction: column;
  }

  .no-proposals {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
