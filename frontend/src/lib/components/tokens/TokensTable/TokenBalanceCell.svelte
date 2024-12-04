<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { ENABLE_USD_VALUES } from "$lib/stores/feature-flags.store";
  import type {
    UserTokenData,
    UserTokenFailed,
    UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { formatNumber } from "$lib/utils/format.utils";
  import {
    isUserTokenData,
    isUserTokenLoading,
  } from "$lib/utils/user-token.utils";
  import { Spinner } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;
</script>

{#if isUserTokenLoading(rowData)}
  <span data-tid="token-value-label" class="balance-spinner"
    ><Spinner inline size="tiny" /></span
  >
{:else if isUserTokenData(rowData)}
  <div class="values">
    <AmountDisplay singleLine amount={rowData.balance} />
    {#if $ENABLE_USD_VALUES}
      <span data-tid="usd-value" class="usd-value">
        {#if nonNullish(rowData.balanceInUsd)}
          ${formatNumber(rowData.balanceInUsd)}
        {:else}
          $-/-
        {/if}
      </span>
    {/if}
  </div>
{:else}
  <span data-tid="unavailable-balance" class="value">-/-</span>
{/if}

<style lang="scss">
  .balance-spinner {
    display: flex;
    align-items: center;
  }

  .values {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    .usd-value {
      color: var(--text-description);
      font-size: var(--font-size-small);
    }
  }
</style>
