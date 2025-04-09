<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import IcpExchangeRateInfoTooltip from "$lib/components/ui/IcpExchangeRateInfoTooltip.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import {
    getLedgerCanisterIdFromToken,
    getUsdValue,
  } from "$lib/utils/token.utils";
  import {
    isNullish,
    nonNullish,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";

  export let amount: number = 0;
  export let balance: bigint | undefined = undefined;
  export let token: Token;
  export let errorState: boolean = false;

  const safeTokenAmount = (
    amount: number,
    token: Token
  ): TokenAmountV2 | undefined => {
    try {
      if (isNaN(amount) || !isFinite(amount)) {
        return;
      }
      return TokenAmountV2.fromNumber({ amount, token });
    } catch (_) {
      return;
    }
  };

  let ledgerCanisterId: string | undefined;
  ledgerCanisterId = getLedgerCanisterIdFromToken(
    token,
    $tokensByLedgerCanisterIdStore
  );

  let tokenPrice: number | undefined;
  $: tokenPrice =
    nonNullish(ledgerCanisterId) &&
    nonNullish($icpSwapUsdPricesStore) &&
    $icpSwapUsdPricesStore !== "error"
      ? $icpSwapUsdPricesStore[ledgerCanisterId]
      : undefined;

  let tokens: TokenAmountV2 | undefined;
  $: tokens = safeTokenAmount(amount, token);

  let usdValue: number | undefined;
  $: usdValue =
    nonNullish(tokens) && nonNullish(tokenPrice)
      ? getUsdValue({ amount: tokens, tokenPrice })
      : undefined;

  let usdValueFormatted: string;
  $: usdValueFormatted = nonNullish(usdValue)
    ? formatNumber(usdValue)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let hasError: boolean;
  $: hasError = $icpSwapUsdPricesStore === "error" || isNullish(tokenPrice);
</script>

<div
  class="wrapper"
  class:has-error={errorState}
  data-tid="amount-input-fiat-value-component"
>
  <div class="fiat">
    <span data-tid="fiat-value">
      ${usdValueFormatted}
    </span>
    <IcpExchangeRateInfoTooltip {hasError} />
  </div>
  {#if nonNullish(balance)}
    <span class="balance" data-tid="balance">
      <span>
        {$i18n.accounts.balance}:
      </span>
      <AmountDisplay
        singleLine
        amount={TokenAmountV2.fromUlps({
          amount: balance,
          token,
        })}
      />
    </span>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
    }

    .fiat {
      @include fonts.standard(true);

      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
      color: var(--text-description);
    }

    .balance {
      @include fonts.standard(true);

      margin: 0;
      padding: 0;
      color: var(--text-description);
      --amount-color: var(--text-description);
      --amount-weight: var(--font-weight-bold);
    }
  }

  .wrapper.has-error {
    .balance {
      color: var(--negative-emphasis);
      --amount-color: var(--negative-emphasis);
    }
  }
</style>
