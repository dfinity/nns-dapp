<script lang="ts">
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import {
    actionableProposalsLoadedStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
  import LoadingActionableProposals from "$lib/components/proposals/LoadingActionableProposals.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
</script>

<div class="container" data-tid="actionable-proposals-component">
  {#if $actionableProposalsLoadedStore}
    {#if $actionableProposalTotalCountStore > 0}
      <ActionableNnsProposals />
      <ActionableSnses />
    {:else}
      <ActionableProposalsEmpty />
    {/if}
  {:else}
    <LoadingActionableProposals />
  {/if}
</div>

<style lang="scss">
  .container {
    // The gap between blocks on the page (e.g. between the universes and banners)
    --actionable-page-gap: var(--padding-4x);

    display: flex;
    flex-direction: column;
    gap: var(--actionable-page-gap);
  }
</style>
