<script lang="ts">
  import {
    type ActionableSnsProposalsByUniverseData,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import ActionableSnsProposals from "$lib/components/proposals/ActionableSnsProposals.svelte";

  export let cardIndex = 0;

  let actionableUniverses: ActionableSnsProposalsByUniverseData[] = [];
  $: actionableUniverses = $actionableSnsProposalsByUniverseStore.filter(
    ({ proposals }) => proposals.length > 0
  );
</script>

<div data-tid="actionable-snses-component">
  {#each actionableUniverses as { universe, proposals } (universe.canisterId)}
    <ActionableSnsProposals {universe} {proposals} {cardIndex} />
  {/each}
</div>
