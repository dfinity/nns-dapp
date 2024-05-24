<script lang="ts">
  import type { UserTokenData, UserTokenLoading } from "$lib/types/tokens-page";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";

  export let rowData: UserTokenData | UserTokenLoading;
</script>

{#if rowData.balance instanceof UnavailableTokenAmount}
  <span data-tid="token-value-label"
    >{`-/- ${rowData.balance.token.symbol}`}</span
  >
{:else if rowData.balance === "loading"}
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
