<script lang="ts">
  import { Copy } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import LinkIcon from "$lib/components/common/LinkIcon.svelte";

  export let label: string;
  export let canisterId: string | undefined = undefined;
  export let canisterLinkHref: string | undefined = undefined;
  export let canisterIdFallback: string | undefined = undefined;
</script>

<div class="container" data-tid="import-token-canister-id-component">
  <span data-tid="label">{label}</span>
  <div class="canister-id">
    {#if nonNullish(canisterId)}
      <span class="value description" data-tid="canister-id">{canisterId}</span>
      <Copy value={canisterId} />
      {#if nonNullish(canisterLinkHref)}
        <LinkIcon href={canisterLinkHref} />
      {/if}
    {:else if nonNullish(canisterIdFallback)}
      <span class="fallback description" data-tid="canister-id-fallback"
        >{canisterIdFallback}</span
      >
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .canister-id {
    display: flex;
    align-items: center;
    color: var(--primary);

    // preserve icon buttons height
    min-height: var(--padding-4x);
  }

  .value {
    margin-right: var(--padding-0_5x);
  }
</style>
