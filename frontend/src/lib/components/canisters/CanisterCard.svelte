<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { Card, SkeletonText } from "@dfinity/gix-components";
  import CanisterCardTitle from "./CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "./CanisterCardSubTitle.svelte";
  import { formatNumber } from "$lib/utils/format.utils";
  import { nonNullish } from "$lib/utils/utils";
  import CanisterCardCycles from "$lib/components/canisters/CanisterCardCycles.svelte";

  export let canister: CanisterDetails;
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <div slot="start" class="title">
    <CanisterCardTitle {canister} />

    <CanisterCardSubTitle {canister} />
  </div>

  <CanisterCardCycles {canister} />
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include card.stacked-title;
    @include card.title;
  }

  span.value {
    @include fonts.h2(true);

    @include media.min-width(medium) {
      @include fonts.h1(true);
    }
  }
</style>
