<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import { actionableProposalsLoadedStore } from "$lib/derived/actionable-proposals.derived";
  import LoadingActionableProposals from "$lib/components/proposals/LoadingActionableProposals.svelte";
</script>

<TestIdWrapper testId="actionable-proposals-component">
  {#if $actionableProposalsLoadedStore}
    <ActionableNnsProposals />
    <ActionableSnses />
  {:else}
    <LoadingActionableProposals />
  {/if}
  <!-- TODO: No proposals banner -->
</TestIdWrapper>
