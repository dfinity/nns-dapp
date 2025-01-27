<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
</script>

<TestIdWrapper testId="actionable-nns-proposals-component">
  {#if $actionableNnsProposalsStore?.proposals?.length ?? 0 > 0}
    <UniverseWithActionableProposals universe={$nnsUniverseStore}>
      {#each $actionableNnsProposalsStore?.proposals ?? [] as proposalInfo (proposalInfo.id)}
        <NnsProposalCard actionable fromActionablePage {proposalInfo} />
      {/each}
    </UniverseWithActionableProposals>
  {/if}
</TestIdWrapper>
