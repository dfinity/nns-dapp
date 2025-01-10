<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableProposalsSignIn from "$lib/components/proposals/ActionableProposalsSignIn.svelte";
  import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import type { SnsProposalActionableData } from "$lib/derived/sns/sns-filtered-actionable-proposals.derived";
  import ListLoader from "$lib/components/proposals/ListLoader.svelte";
  import LoadingProposals from "$lib/components/proposals/LoadingProposals.svelte";
  import NoProposals from "$lib/components/proposals/NoProposals.svelte";
  import SnsProposalsFilters from "$lib/components/sns-proposals/SnsProposalsFilters.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import { fromNullable, isNullish } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  export let proposals: SnsProposalActionableData[] | undefined;
  export let actionableSelected: boolean;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let disableInfiniteScroll = false;
  export let loadingNextPage = false;
</script>

<TestIdWrapper testId="sns-proposal-list-component">
  <SnsProposalsFilters />

  {#if !actionableSelected}
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
              <SnsProposalCard
                actionable={proposalData.isActionable}
                {proposalData}
                {nsFunctions}
                rootCanisterId={$pageStore.universe}
              />
            {/each}
          </InfiniteScroll>
        </ListLoader>
      {/if}
    </div>
  {:else}
    <div in:fade data-tid="actionable-proposal-list">
      {#if !$authSignedInStore}
        <ActionableProposalsSignIn />
      {:else if isNullish(proposals)}
        <LoadingProposals />
      {:else if proposals.length === 0}
        <ActionableProposalsEmpty />
      {:else}
        <InfiniteScroll layout="grid" disabled>
          {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
            <SnsProposalCard
              actionable={proposalData.isActionable}
              {proposalData}
              rootCanisterId={$pageStore.universe}
              {nsFunctions}
            />
          {/each}
        </InfiniteScroll>
      {/if}
    </div>
  {/if}
</TestIdWrapper>
