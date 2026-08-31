<script lang="ts">
  import Copy from "$lib/components/ui/Copy.svelte";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import type { CanistersTableRowData } from "$lib/types/canisters-table";
  import { mapCanisterDetails } from "$lib/utils/canisters.utils";

  export let rowData: CanistersTableRowData;

  let canisterId: string;
  let validName: boolean;
  $: ({ canisterId, validName } = mapCanisterDetails(rowData.canister));
</script>

<div class="title-wrapper" data-tid="canister-title-cell-component">
  <h5 data-tid="canister-name" class="title">
    <span>{validName ? rowData.canister.name : canisterId}</span>
    {#if !validName}
      <Copy value={canisterId} />
    {/if}
  </h5>
  {#if validName}
    <IdentifierHash identifier={canisterId} />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .title-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  h5 {
    margin: 0;
    display: flex;
    align-items: center;

    span {
      @include text.clamp(2);
      overflow-wrap: anywhere;
    }
  }
</style>
