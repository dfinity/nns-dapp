<script lang="ts">
  import {
    type ActionableSnsProposalsByUniverseData,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import ActionableSnsProposals from "$lib/components/proposals/ActionableSnsProposals.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

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
