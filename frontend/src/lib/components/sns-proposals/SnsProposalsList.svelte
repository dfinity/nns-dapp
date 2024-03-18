<script lang="ts">
  import type { SnsProposalData } from "@dfinity/sns";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { fromNullable, isNullish } from "@dfinity/utils";
  import NoProposals from "../proposals/NoProposals.svelte";
  import LoadingProposals from "../proposals/LoadingProposals.svelte";
  import ListLoader from "../proposals/ListLoader.svelte";
  import SnsProposalsFilters from "./SnsProposalsFilters.svelte";
  import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
  import { fade } from "svelte/transition";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let proposals: SnsProposalData[] | undefined;
  export let isActionable: boolean;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let disableInfiniteScroll = false;
  export let loadingNextPage = false;
</script>

<TestIdWrapper testId="sns-proposal-list-component">
  <SnsProposalsFilters />

  {#if !$ENABLE_VOTING_INDICATION || !isActionable}
    <div in:fade data-tid="all-proposal-list">
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
    </div>
  {/if}

  {#if $ENABLE_VOTING_INDICATION && isActionable}
    {#if proposals === undefined}
      <!-- TODO(max): TBD SignIn vs No vs NotSupported -->
      <LoadingProposals />
    {:else if proposals.length === 0}
      <!-- TODO(max): TBD custom screen -->
      <NoProposals />
    {:else}
      <div in:fade data-tid="actionable-proposal-list">
        <ListLoader loading={isNullish(proposals)}>
          <InfiniteScroll layout="grid" disabled>
            {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
              <SnsProposalCard {proposalData} {nsFunctions} />
            {/each}
          </InfiniteScroll>
        </ListLoader>
      </div>
    {/if}
  {/if}
</TestIdWrapper>
