<script lang="ts">
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import {
    actionableProposalNotSupportedUniversesStore,
    actionableProposalsLoadedStore,
    actionableProposalTotalCountStore,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import SnsWithActionableProposals from "$lib/components/proposals/SnsWithActionableProposals.svelte";
  import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
  import LoadingProposals from "$lib/components/proposals/LoadingProposals.svelte";
  import ActionableProposalsNotSupportedSnses from "$lib/components/proposals/ActionableProposalsNotSupportedSnses.svelte";
</script>

{#if $actionableProposalTotalCountStore === 0}
  {#if $actionableProposalsLoadedStore}
    <ActionableProposalsEmpty />
  {:else}
    <LoadingProposals />
  {/if}
{:else}
  <!-- Nns -->
  <UniverseWithActionableProposals universe={$nnsUniverseStore}>
    {#each $actionableNnsProposalsStore?.proposals ?? [] as proposalInfo (proposalInfo.id)}
      <NnsProposalCard actionable fromActionablePage {proposalInfo} />
    {/each}
  </UniverseWithActionableProposals>

  <!-- Sns -->
  {#each $actionableSnsProposalsByUniverseStore ?? [] as snsUniverse (snsUniverse.universe.canisterId)}
    <SnsWithActionableProposals universe={snsUniverse.universe} />
  {/each}
{/if}

{#if $actionableProposalNotSupportedUniversesStore.length > 0}
  <ActionableProposalsNotSupportedSnses />
{/if}
