<script lang="ts">
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import {
    actionableProposalsLoadedStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
  import LoadingActionableProposals from "$lib/components/proposals/LoadingActionableProposals.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableProposalsNotSupportedSnses from "$lib/components/proposals/ActionableProposalsNotSupportedSnses.svelte";
  import { fade } from "svelte/transition";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";

  let nnsProposalCount = 0;
  $: nnsProposalCount = ($actionableNnsProposalsStore?.proposals ?? []).length;
</script>

<div class="container" data-tid="actionable-proposals-component">
  {#if $actionableProposalsLoadedStore}
    {#if $actionableProposalTotalCountStore > 0}
      <ActionableNnsProposals />
      <ActionableSnses cardIndex={nnsProposalCount} />
      <div in:fade>
        <ActionableProposalsNotSupportedSnses />
      </div>
    {:else}
      <div in:fade>
        <ActionableProposalsEmpty />
      </div>
    {/if}
  {:else}
    <div in:fade>
      <LoadingActionableProposals />
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>
