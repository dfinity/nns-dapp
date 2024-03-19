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
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import ActionableProposalsSignIn from "$lib/components/proposals/ActionableProposalsSignIn.svelte";
  import ActionableProposalsNotSupported from "$lib/components/proposals/ActionableProposalsNotSupported.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";

  export let snsName: string | undefined;
  export let proposals: SnsProposalData[] | undefined;
  export let includeBallots: boolean;
  export let actionableSelected: boolean;
  export let nsFunctions: SnsNervousSystemFunction[] | undefined;
  export let disableInfiniteScroll = false;
  export let loadingNextPage = false;
</script>

<TestIdWrapper testId="sns-proposal-list-component">
  <SnsProposalsFilters />

  {#if !$ENABLE_VOTING_INDICATION || !actionableSelected}
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

  {#if $ENABLE_VOTING_INDICATION && actionableSelected}
    <div in:fade data-tid="actionable-proposal-list">
      {#if !$authSignedInStore}
        <ActionableProposalsSignIn />
      {:else if isNullish(proposals)}
        <LoadingProposals />
      {:else if includeBallots === false}
        <ActionableProposalsNotSupported snsName={snsName ?? ""} />
      {:else if proposals.length === 0}
        <ActionableProposalsEmpty />
      {:else}
        <InfiniteScroll layout="grid" disabled>
          {#each proposals as proposalData (fromNullable(proposalData.id)?.id)}
            <SnsProposalCard {proposalData} {nsFunctions} />
          {/each}
        </InfiniteScroll>
      {/if}
    </div>
  {/if}
</TestIdWrapper>
