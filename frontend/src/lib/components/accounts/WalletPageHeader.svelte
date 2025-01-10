<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import PageHeader from "$lib/components/common/PageHeader.svelte";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let universe: Universe;
  export let walletAddress: string | undefined;
</script>

<PageHeader testId="wallet-page-header-component">
  <div slot="start" class="header-start">
    <UniverseSummary {universe} />
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
    // This is needed to align in the center the UniverseSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
