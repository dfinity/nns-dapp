<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
  import {
    actionableProposalNotSupportedUniversesStore,
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
    {:else}
      <ActionableProposalsEmpty />
    {/if}
  {:else}
    <LoadingActionableProposals />
  {/if}
  {#if $actionableProposalNotSupportedUniversesStore.length > 0}
    <div class="unsupported-snses">
      <ActionableProposalsNotSupportedSnses />
    </div>
  {/if}
</TestIdWrapper>

<style lang="scss">
  .unsupported-snses {
    margin-top: var(--padding-3x);
  }
</style>
