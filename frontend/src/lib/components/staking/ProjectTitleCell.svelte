<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import type { TableProject } from "$lib/types/staking";
  import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
  import NnsNeuronsMissingRewardsBadge from "$lib/components/neurons/NnsNeuronsMissingRewardsBadge.svelte";
  import { ENABLE_PERIODIC_FOLLOWING_CONFIRMATION } from "$lib/stores/feature-flags.store";

  export let rowData: TableProject;
</script>

<div data-tid="project-title-cell-component" class="title-logo-wrapper">
  <Logo src={rowData.logo} alt={rowData.title} size="medium" framed />
  <div class="title-wrapper">
    <h5 data-tid="project-title">{rowData.title}</h5>
  </div>
  {#if $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION && rowData.universeId === OWN_CANISTER_ID_TEXT}
    <NnsNeuronsMissingRewardsBadge />
  {/if}
</div>

<style lang="scss">
  h5 {
    margin: 0;
  }

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }
</style>
