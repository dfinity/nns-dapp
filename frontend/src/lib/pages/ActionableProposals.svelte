<script lang="ts">
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import {
    actionableProposalTotalCountStore,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import SnsWithActionableProposals from "$lib/components/proposals/SnsWithActionableProposals.svelte";

  actionableProposalTotalCountStore;
</script>

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

<!--
<LoadingProposals />
<ActionableProposalsEmpty />

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
-->
