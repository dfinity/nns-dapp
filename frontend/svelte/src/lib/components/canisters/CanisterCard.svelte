<script lang="ts">
  import type { CanisterDetails } from "../../canisters/nns-dapp/nns-dapp.types";
  import Card from "../ui/Card.svelte";
  import Identifier from "../ui/Identifier.svelte";
  import Copy from "../ui/Copy.svelte";

  export let canister: CanisterDetails;
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;

  let canisterId: string;
  $: canisterId = canister.canister_id.toText();
  let validName: boolean;
  $: validName = canister.name.length > 0;
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <div slot="start" class="title-block">
    <div class="title">
      <h3>{validName ? canister.name : canisterId}</h3>

      {#if !validName}
        <Copy value={canisterId} />
      {/if}
    </div>
  </div>

  {#if validName}
    <Identifier identifier={canisterId} showCopy />
  {/if}
</Card>

<style lang="scss">
  @use "../../themes/mixins/card.scss";

  .title {
    @include card.stacked-title;
    @include card.title;
  }

  .title {
    display: flex;
    flex-direction: row;
    align-items: baseline;

    :global(button) {
      margin-left: var(--padding-0_5x);
    }
  }
</style>
