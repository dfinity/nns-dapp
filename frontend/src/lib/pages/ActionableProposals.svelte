<script lang="ts">
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import LoadingActionableProposals from "$lib/components/proposals/LoadingActionableProposals.svelte";
  import {
    actionableProposalsLoadedStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
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
    display: flex;
    flex-direction: column;
    gap: var(--padding-6x);
  }
</style>
