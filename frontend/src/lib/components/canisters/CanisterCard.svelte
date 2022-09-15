<script lang="ts">
  import type { CanisterDetails } from "../../canisters/nns-dapp/nns-dapp.types";
  import { Card } from "@dfinity/gix-components";
  import CanisterCardTitle from "./CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "./CanisterCardSubTitle.svelte";

  export let canister: CanisterDetails;
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <div slot="start" class="title-block">
    <CanisterCardTitle {canister} />
  </div>

  <CanisterCardSubTitle {canister} />
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";

  .title-block {
    @include card.stacked-title;
    @include card.title;
  }
</style>
