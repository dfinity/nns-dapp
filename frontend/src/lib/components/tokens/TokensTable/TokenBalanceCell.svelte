<script lang="ts">
  import AmountWithUsd from "$lib/components/ic/AmountWithUsd.svelte";
  import type {
    UserTokenData,
    UserTokenFailed,
    UserTokenLoading,
  } from "$lib/types/tokens-page";
  import {
    isUserTokenData,
    isUserTokenLoading,
  } from "$lib/utils/user-token.utils";
  import { Spinner } from "@dfinity/gix-components";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;
</script>

{#if isUserTokenLoading(rowData)}
  <span data-tid="token-value-label" class="balance-spinner"
    ><Spinner inline size="tiny" /></span
  >
{:else if isUserTokenData(rowData)}
  <AmountWithUsd amount={rowData.balance} amountInUsd={rowData.balanceInUsd} />
{:else}
  <span data-tid="unavailable-balance" class="value">-/-</span>
{/if}

<style lang="scss">
  .balance-spinner {
    display: flex;
    align-items: center;
  }
</style>
