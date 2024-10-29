<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableSnsProposals from "$lib/components/proposals/ActionableSnsProposals.svelte";
  import {
    actionableSnsProposalsByUniverseStore,
    type ActionableSnsProposalsByUniverseData,
  } from "$lib/derived/actionable-proposals.derived";

  let actionableUniverses: ActionableSnsProposalsByUniverseData[] = [];
  $: actionableUniverses = $actionableSnsProposalsByUniverseStore.filter(
    ({ proposals }) => proposals.length > 0
  );
</script>

<TestIdWrapper testId="actionable-snses-component">
  {#each actionableUniverses as { universe, proposals } (universe.canisterId)}
    <ActionableSnsProposals {universe} {proposals} />
  {/each}
</TestIdWrapper>
