<script lang="ts">
  import type { CanisterDetails } from "../../canisters/nns-dapp/nns-dapp.types";
  import Copy from "../ui/Copy.svelte";
  import { mapCanisterDetails } from "../../utils/canisters.utils";

  export let canister: CanisterDetails;
  export let titleTag: "h1" | "h3" = "h3";

  let canisterId: string;
  let validName: boolean;
  $: ({ canisterId, validName } = mapCanisterDetails(canister));
</script>

<div class={`title-block ${titleTag}`}>
  <svelte:element this={titleTag} class="title"
    >{validName ? canister.name : canisterId}</svelte:element
  >

  {#if !validName}
    <Copy value={canisterId} />
  {/if}
</div>

<style lang="scss">
  .h3 {
    :global(button) {
      margin-bottom: var(--padding-0_5x);
    }
  }

  .h1 {
    :global(button) {
      margin-bottom: var(--padding);
    }
  }

  .title {
    white-space: pre-wrap;
    display: initial;
  }
</style>
