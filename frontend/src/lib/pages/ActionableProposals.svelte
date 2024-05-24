<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import { actionableProposalTotalCountStore } from "$lib/derived/actionable-proposals.derived";
</script>

<TestIdWrapper testId="actionable-proposals-component">
  {#if $actionableProposalTotalCountStore > 0}
    <UniverseWithActionableProposals universe={$nnsUniverseStore}>
      {#each $actionableNnsProposalsStore?.proposals ?? [] as proposalInfo (proposalInfo.id)}
        <NnsProposalCard actionable {proposalInfo} />
      {/each}
    </UniverseWithActionableProposals>
  {/if}
</TestIdWrapper>
