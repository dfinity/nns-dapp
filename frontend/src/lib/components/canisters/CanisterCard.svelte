<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { Card } from "@dfinity/gix-components";
  import CanisterCardTitle from "./CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "./CanisterCardSubTitle.svelte";
  import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";

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
  @use "@dfinity/gix-components/dist/styles/mixins/card";

  .title {
    @include card.title;
  }
</style>
