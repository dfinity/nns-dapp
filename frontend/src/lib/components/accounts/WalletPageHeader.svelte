<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import PageHeader from "../common/PageHeader.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";

  export let universe: Universe;
  export let walletAddress: string;
</script>

<PageHeader testId="wallet-page-header-component">
  <UniversePageSummary slot="start" {universe} />
  <span
    slot="end"
    class="description header-end"
    data-tid="wallet-header-account-identifier"
  >
    <IdentifierHash identifier={walletAddress} />
  </span>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
