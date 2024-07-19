<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { UserTokenData, UserTokenLoading } from "$lib/types/tokens-page";
  import { Spinner } from "@dfinity/gix-components";

  export let rowData: UserTokenData | UserTokenLoading;
</script>

{#if rowData.balance === "loading"}
  <span data-tid="token-value-label" class="balance-spinner"
    ><Spinner inline size="tiny" /></span
  >
{:else}
  <AmountDisplay singleLine amount={rowData.balance} />
{/if}

<style lang="scss">
  .balance-spinner {
    display: flex;
    align-items: center;
  }
</style>
