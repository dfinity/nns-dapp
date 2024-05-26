<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import {
    type ActionableSnsProposalsByUniverseData,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import ActionableSnsProposals from "$lib/components/proposals/ActionableSnsProposals.svelte";

  let actionableUniverses: ActionableSnsProposalsByUniverseData[] = [];
  $: actionableUniverses =
    $actionableSnsProposalsByUniverseStore.filter(
      ({ proposals }) => proposals.length > 0
    );
</script>

<TestIdWrapper testId="actionable-snses-component">
  {#each actionableUniverses as actionableUniverse (actionableUniverse.universe.canisterId)}
    <ActionableSnsProposals {actionableUniverse} />
  {/each}
</TestIdWrapper>
