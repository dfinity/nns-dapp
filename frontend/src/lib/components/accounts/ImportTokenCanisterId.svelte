<script lang="ts">
  import LinkToDashboardCanister from "$lib/components/tokens/LinkToDashboardCanister.svelte";
  import Copy from "$lib/components/ui/Copy.svelte";
  import type { Principal } from "@icp-sdk/core/principal";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    canisterId?: Principal;
    canisterIdFallback?: string;
    label: string;
    testId?: string;
  };
  const {
    canisterId,
    canisterIdFallback,
    label,
    testId = "import-token-canister-id-component",
  }: Props = $props();
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
