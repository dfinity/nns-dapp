<script lang="ts">
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import NnsProposalsFilters from "./NnsProposalsFilters.svelte";
  import { filteredActionableProposals } from "$lib/derived/proposals.derived";
  import NoProposals from "./NoProposals.svelte";
  import LoadingProposals from "./LoadingProposals.svelte";
  import ListLoader from "./ListLoader.svelte";
  import { building } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { fade } from "svelte/transition";
  import type { ProposalInfo } from "@dfinity/nns";
  import { isNullish } from "@dfinity/utils";
  import ActionableProposalsSignIn from "$lib/components/proposals/ActionableProposalsSignIn.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;

  // Prevent pre-rendering issue "IntersectionObserver is not defined"
  // Note: Another solution would be to lazy load the InfiniteScroll component
  let display = true;
  $: display = !building;

  let actionableProposals: ProposalInfo[] | undefined;
  $: actionableProposals = $actionableNnsProposalsStore.proposals;
</script>

<TestIdWrapper testId="nns-proposal-list-component">
  <NnsProposalsFilters />

  {#if display}
    {#if !$actionableProposalsActiveStore}
      <div data-tid="all-proposal-list">
        {#if loadingAnimation === "skeleton"}
          <LoadingProposals />
        {:else if nothingFound}
          <NoProposals />
        {:else}
          <ListLoader loading={loadingAnimation === "spinner"}>
            <InfiniteScroll
              on:nnsIntersect
              layout="grid"
              disabled={disableInfiniteScroll || loading}
            >
              {#each $filteredActionableProposals.proposals as proposalInfo, index (proposalInfo.id)}
                <NnsProposalCard
                  {hidden}
                  {index}
                  actionable={proposalInfo.isActionable}
                  {proposalInfo}
                />
              {/each}
            </InfiniteScroll>
          </ListLoader>
        {/if}
      </div>
    {:else}
      <div data-tid="actionable-proposal-list">
        {#if !$authSignedInStore}
          <ActionableProposalsSignIn />
        {:else if isNullish(actionableProposals)}
          <LoadingProposals />
        {:else if actionableProposals?.length === 0}
          <ActionableProposalsEmpty />
        {:else}
          <InfiniteScroll layout="grid" disabled>
            {#each actionableProposals ?? [] as proposalInfo, index (proposalInfo.id)}
              <NnsProposalCard {hidden} {index} actionable {proposalInfo} />
            {/each}
          </InfiniteScroll>
        {/if}
      </div>
    {/if}
  {/if}
</TestIdWrapper>
