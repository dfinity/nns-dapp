<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";
  import CanisterCardSubTitle from "$lib/components/canisters/CanisterCardSubTitle.svelte";
  import CanisterCardTitle from "$lib/components/canisters/CanisterCardTitle.svelte";
  import { Card } from "@dfinity/gix-components";

  export let canister: CanisterDetails;
  export let href: string;
  export let ariaLabel: string | undefined = undefined;
</script>

<Card {href} {ariaLabel} testId="canister-card">
  <div slot="start" class="title">
    <CanisterCardTitle {canister} />

    <CanisterCardSubTitle {canister} />
  </div>

  <CanisterCardCycles {canister} />
</Card>

<style lang="scss">
  .title {
    width: 100%;
  }
</style>
