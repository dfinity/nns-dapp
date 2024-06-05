<script lang="ts">
  import NnsProposalCard from "./NnsProposalCard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
</script>

<TestIdWrapper testId="actionable-nns-proposals-component">
  {#if $actionableNnsProposalsStore?.proposals?.length ?? 0 > 0}
    <UniverseWithActionableProposals universe={$nnsUniverseStore} noAnimation>
      {#each $actionableNnsProposalsStore?.proposals ?? [] as proposalInfo, index (proposalInfo.id)}
        <NnsProposalCard actionable fromActionablePage {proposalInfo} {index} />
      {/each}
    </UniverseWithActionableProposals>
  {/if}
</TestIdWrapper>
