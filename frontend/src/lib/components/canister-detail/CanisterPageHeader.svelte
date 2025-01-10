<script lang="ts">
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import PageHeader from "$lib/components/common/PageHeader.svelte";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";

  export let canister: CanisterInfo;
</script>

<PageHeader testId="canister-page-header-component">
  <UniverseSummary slot="start" universe={$nnsUniverseStore} />
  <div slot="end" class="description header-end" data-tid="canister-id-element">
    <IdentifierHash identifier={canister.canister_id.toText()} />
  </div>
</PageHeader>

<style lang="scss">
  .header-end {
    // The IdentifierHash has the copy button at the end which has some extra padding.
    // This is needed to align in the center the UniverseSummary and the IdentifierHash in mobile view.
    padding-left: var(--padding-1_5x);
  }
</style>
