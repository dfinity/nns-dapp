<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type {
    UserTokenData,
    UserTokenFailed,
    UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { Spinner } from "@dfinity/gix-components";
  import {
    isUserTokenData,
    isUserTokenLoading,
  } from "$lib/utils/user-token.utils";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;
</script>

{#if isUserTokenLoading(rowData)}
  <span data-tid="token-value-label" class="balance-spinner"
    ><Spinner inline size="tiny" /></span
  >
{:else if isUserTokenData(rowData)}
  <AmountDisplay singleLine amount={rowData.balance} />
{:else}
  <span class="value">-/-</span>
{/if}

<style lang="scss">
  .balance-spinner {
    display: flex;
    align-items: center;
  }
</style>
