<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import {
    actionableProposalsLoadedStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
  import LoadingActionableProposals from "$lib/components/proposals/LoadingActionableProposals.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import ActionableProposalsNotSupportedSnses from "$lib/components/proposals/ActionableProposalsNotSupportedSnses.svelte";
</script>

<TestIdWrapper testId="actionable-proposals-component">
  {#if $actionableProposalsLoadedStore}
    {#if $actionableProposalTotalCountStore > 0}
      <ActionableNnsProposals />
      <ActionableSnses />
      <ActionableProposalsNotSupportedSnses />
    {:else}
      <ActionableProposalsEmpty />
    {/if}
  {:else}
    <LoadingActionableProposals />
  {/if}
</TestIdWrapper>
