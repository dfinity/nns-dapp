<script lang="ts">
  import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";
  import { Copy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";

  export let label: string;
  export let testId: string = "import-token-canister-id-component";
  export let canisterId: Principal | undefined = undefined;
  export let canisterIdFallback: string | undefined = undefined;
</script>

<div class="container" data-tid={testId}>
  <span data-tid="label">{label}</span>
  <div class="canister-id">
    {#if nonNullish(canisterId)}
      <span class="value description" data-tid="canister-id">{canisterId}</span>
      <Copy value={canisterId.toText()} />
      <LinkToDashboardCanister {canisterId} />
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
