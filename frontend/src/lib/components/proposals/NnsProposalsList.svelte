<script lang="ts">
  import { building } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableProposalsSignIn from "$lib/components/proposals/ActionableProposalsSignIn.svelte";
  import ListLoader from "$lib/components/proposals/ListLoader.svelte";
  import LoadingProposals from "$lib/components/proposals/LoadingProposals.svelte";
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import NnsProposalsFilters from "$lib/components/proposals/NnsProposalsFilters.svelte";
  import NoProposals from "$lib/components/proposals/NoProposals.svelte";
  import { actionableProposalsActiveStore } from "$lib/derived/actionable-proposals.derived";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { filteredActionableProposals } from "$lib/derived/proposals.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { InfiniteScroll } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";
  import { fade } from "svelte/transition";

  type Props = {
    hidden: boolean;
    disableInfiniteScroll: boolean;
    loading: boolean;
    loadingAnimation?: "spinner" | "skeleton";
    loadNextProposals: () => Promise<void>;
  };

  const {
    hidden,
    disableInfiniteScroll,
    loading,
    loadingAnimation,
    loadNextProposals,
  }: Props = $props();

  // Prevent pre-rendering issue "IntersectionObserver is not defined"
  // Note: Another solution would be to lazy load the InfiniteScroll component
  const display = $derived(!building);
  const actionableProposals = $derived($actionableNnsProposalsStore.proposals);
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
              onIntersect={loadNextProposals}
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
          <!-- TODO: Fix once GIX makes the cb optional -->
          <InfiniteScroll layout="grid" onIntersect={async () => {}}>
            {#each actionableProposals ?? [] as proposalInfo (proposalInfo.id)}
              <NnsProposalCard {hidden} actionable {proposalInfo} />
            {/each}
          </InfiniteScroll>
        {/if}
      </div>
    {/if}
  {/if}
</TestIdWrapper>
