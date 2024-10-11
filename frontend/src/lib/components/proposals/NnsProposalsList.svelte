<script lang="ts">
  import { building } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableProposalsSignIn from "$lib/components/proposals/ActionableProposalsSignIn.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { filteredActionableProposals } from "$lib/derived/proposals.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import ListLoader from "./ListLoader.svelte";
  import LoadingProposals from "./LoadingProposals.svelte";
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import NnsProposalsFilters from "./NnsProposalsFilters.svelte";
  import NoProposals from "./NoProposals.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import type { ProposalInfo } from "@dfinity/nns";
  import { isNullish } from "@dfinity/utils";
  import { fade } from "svelte/transition";
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
      <div in:fade data-tid="all-proposal-list">
        {#if loadingAnimation === "skeleton"}
          <LoadingProposals />
        {:else if $filteredActionableProposals.proposals.length === 0}
          <NoProposals />
        {:else}
          <ListLoader loading={loadingAnimation === "spinner"}>
            <InfiniteScroll
              on:nnsIntersect
              layout="grid"
              disabled={disableInfiniteScroll || loading}
            >
              {#each $filteredActionableProposals.proposals as proposalInfo (proposalInfo.id)}
                <NnsProposalCard
                  {hidden}
                  actionable={proposalInfo.isActionable}
                  {proposalInfo}
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
        {:else if isNullish(actionableProposals)}
          <LoadingProposals />
        {:else if actionableProposals?.length === 0}
          <ActionableProposalsEmpty />
        {:else}
          <InfiniteScroll layout="grid" disabled>
            {#each actionableProposals ?? [] as proposalInfo (proposalInfo.id)}
              <NnsProposalCard {hidden} actionable {proposalInfo} />
            {/each}
          </InfiniteScroll>
        {/if}
      </div>
    {/if}
  {/if}
</TestIdWrapper>
