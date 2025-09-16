<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import Copy from "$lib/components/ui/Copy.svelte";
  import { mapCanisterDetails } from "$lib/utils/canisters.utils";

  type Props = {
    canister: CanisterDetails;
    titleTag?: "h1" | "h4";
  };

  const { canister, titleTag = "h4" }: Props = $props();
  const { canisterId, validName } = $derived(mapCanisterDetails(canister));
</script>

<div class={`title-block ${titleTag}`} data-tid="canister-card-title-component">
  <svelte:element this={titleTag} class="title value"
    ><span>{validName ? canister.name : canisterId}</span>
    {#if !validName}
      <Copy value={canisterId} />
    {/if}
  </svelte:element>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";

  .title-block {
    @include card.title;

    :global(h4) {
      align-items: center;
    }
  }

  .title {
    display: flex;
    align-items: center;
    text-align: left;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
