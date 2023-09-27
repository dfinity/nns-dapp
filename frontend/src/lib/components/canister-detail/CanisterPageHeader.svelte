<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
  import PageHeader from "../common/PageHeader.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import UniversePageSummary from "../universe/UniversePageSummary.svelte";

  export let canister: CanisterDetails;
</script>

<PageHeader testId="canister-page-header-component">
  <UniversePageSummary slot="start" universe={NNS_UNIVERSE} />
  <span
    slot="end"
    class="description header-end"
    data-tid="canister-id-element"
  >
    <IdentifierHash identifier={canister.canister_id.toText()} />
  </span>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniversePageSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
