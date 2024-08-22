<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import PageHeader from "../common/PageHeader.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let universe: Universe;
  export let walletAddress: string | undefined;
</script>

<PageHeader testId="wallet-page-header-component">
  <div slot="start" class="header-start">
    <UniversePageSummary {universe} />
    <slot name="tags" />
    <slot name="actions" />
  </div>
  <span
    slot="end"
    class="description header-end"
    data-tid="wallet-header-account-identifier"
  >
    {#if nonNullish(walletAddress)}
      <IdentifierHash identifier={walletAddress} />
    {/if}
  </span>
</PageHeader>

<style lang="scss">
  .header-start {
    display: flex;
    gap: var(--padding-0_5x);
  }

  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
