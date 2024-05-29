<script lang="ts">
  import {
    type ActionableSnsProposalsByUniverseData,
    actionableSnsProposalsByUniverseStore,
  } from "$lib/derived/actionable-proposals.derived";
  import ActionableSnsProposals from "$lib/components/proposals/ActionableSnsProposals.svelte";

  let actionableUniverses: ActionableSnsProposalsByUniverseData[] = [];
  $: actionableUniverses = $actionableSnsProposalsByUniverseStore.filter(
    ({ proposals }) => proposals.length > 0
  );
</script>

<div class="container" data-tid="actionable-snses-component">
  {#each actionableUniverses as { universe, proposals } (universe.canisterId)}
    <ActionableSnsProposals {universe} {proposals} />
  {/each}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--actionable-page-gap);
  }
</style>
