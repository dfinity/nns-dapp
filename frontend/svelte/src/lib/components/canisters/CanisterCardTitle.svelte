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

<div class="title">
  <svelte:element this={titleTag}
    >{validName ? canister.name : canisterId}</svelte:element
  >

  {#if !validName}
    <Copy value={canisterId} />
  {/if}
</div>

<style lang="scss">
  .title {
    display: flex;
    flex-direction: row;
    align-items: baseline;

    :global(button) {
      margin-left: var(--padding-0_5x);
    }
  }
</style>
