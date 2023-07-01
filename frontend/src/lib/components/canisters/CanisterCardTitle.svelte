<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { Copy } from "@dfinity/gix-components";
  import { mapCanisterDetails } from "$lib/utils/canisters.utils";

  export let canister: CanisterDetails;
  export let titleTag: "h1" | "h4" = "h4";

  let canisterId: string;
  let validName: boolean;
  $: ({ canisterId, validName } = mapCanisterDetails(canister));
</script>

<div class={`title-block ${titleTag}`} data-tid="canister-card-title-compoment">
  <svelte:element this={titleTag} class="title value"
    ><span>{validName ? canister.name : canisterId}</span>
    {#if !validName}
      <Copy value={canisterId} />
    {/if}
  </svelte:element>
</div>

<style lang="scss">
  .title-block {
    :global(h4) {
      display: inline-flex;
      align-items: center;
    }
  }

  .title {
    white-space: pre-wrap;
    display: initial;
    text-align: left;
  }
</style>
