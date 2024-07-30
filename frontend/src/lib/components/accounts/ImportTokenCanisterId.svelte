<script lang="ts">
  import { Copy } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import LinkIcon from "$lib/components/common/LinkIcon.svelte";

  export let label: string;
  export let canisterId: string | undefined = undefined;
  export let canisterLinkHref: string | undefined = undefined;
  export let canisterIdFallback: string | undefined = undefined;
</script>

<div data-tid="import-token-canister-id-component">
  <span data-tid="label">{label}</span>
  <div class="canister-id">
    <span class="value description" data-tid="canister-id">{canisterId}</span>
    {#if nonNullish(canisterId) && nonNullish(canisterLinkHref)}
      <Copy value={canisterId ?? ""} />
      <LinkIcon href={canisterLinkHref} />
    {:else if nonNullish(canisterIdFallback)}
      <span class="fallback description" data-tid="canister-id-fallback"
        >{canisterIdFallback}</span
      >
    {/if}
  </div>
</div>

<style lang="scss">
  .canister-id {
    display: flex;
    align-items: center;
    color: var(--primary);
  }

  .value {
    margin-right: var(--padding-0_5x);
  }
</style>
