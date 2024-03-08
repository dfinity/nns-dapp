<script lang="ts">
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import NnsProposalsFilters from "./NnsProposalsFilters.svelte";
  import { filteredProposals } from "$lib/derived/proposals.derived";
  import NoProposals from "./NoProposals.svelte";
  import LoadingProposals from "./LoadingProposals.svelte";
  import ListLoader from "./ListLoader.svelte";
  import { building } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { actionableProposalIndicationEnabledStore } from "$lib/derived/actionable-proposals.derived";
  import { fade } from "svelte/transition";
  import type { ProposalInfo } from "@dfinity/nns";
  export let nothingFound: boolean;
  export let hidden: boolean;
  export let disableInfiniteScroll: boolean;
  export let loading: boolean;
  export let loadingAnimation: "spinner" | "skeleton" | undefined;

  // Prevent pre-rendering issue "IntersectionObserver is not defined"
  // Note: Another solution would be to lazy load the InfiniteScroll component
  let display = true;
  $: display = !building;

  let selectedSegment: "all" | "actionable";

  let actionableProposals: ProposalInfo[];
  $: actionableProposals = $actionableNnsProposalsStore.proposals ?? [];
</script>

<TestIdWrapper testId="nns-proposal-list-component">
  <NnsProposalsFilters bind:selectedSegment />

  {#if display}
    {#if selectedSegment === "actionable" && $actionableProposalIndicationEnabledStore && $ENABLE_VOTING_INDICATION}
      <div in:fade data-tid="actionable-proposal-list">
        <InfiniteScroll layout="grid" disabled>
          {#each actionableProposals as proposalInfo (proposalInfo.id)}
            <NnsProposalCard {hidden} {proposalInfo} />
          {/each}
        </InfiniteScroll>
      </div>
    {:else}
      <div in:fade data-tid="all-proposal-list">
        <ListLoader loading={loadingAnimation === "spinner"}>
          <InfiniteScroll
            on:nnsIntersect
            layout="grid"
            disabled={disableInfiniteScroll || loading}
          >
            {#each $filteredProposals.proposals as proposalInfo (proposalInfo.id)}
              <NnsProposalCard {hidden} {proposalInfo} />
            {/each}
          </InfiniteScroll>
        </ListLoader>
      </div>
    {/if}
  {/if}

  {#if nothingFound}
    <NoProposals />
  {/if}

  {#if loadingAnimation === "skeleton"}
    <LoadingProposals />
  {/if}
</TestIdWrapper>
