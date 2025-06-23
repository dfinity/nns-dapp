<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { tokenPriceStore } from "$lib/derived/token-price.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { getUsdValue, toTokenAmountV2 } from "$lib/utils/token.utils";
  import { IconSouth, KeyValuePair } from "@dfinity/gix-components";
  import {
    isNullish,
    nonNullish,
    TokenAmount,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    amount: number;
    receivedAmount: Snippet;
    showLedgerFee?: boolean;
    token: Token;
    transactionFee: TokenAmount | TokenAmountV2;
  };

  const {
    amount,
    receivedAmount,
    showLedgerFee = true,
    token,
    transactionFee,
  }: Props = $props();

  // If we made it this far, the number is valid.
  const tokenAmount = $derived(
    TokenAmountV2.fromNumber({
      amount,
      token,
    })
  );

  const ledgerFeeLabel = $derived(
    replacePlaceholders($i18n.accounts.token_transaction_fee, {
      $tokenSymbol: token.symbol,
    })
  );

  const totalDeducted = $derived(
    tokenAmount.toUlps() + toTokenAmountV2(transactionFee).toUlps()
  );

  const tokenTotalDeducted = $derived(
    TokenAmountV2.fromUlps({
      amount: totalDeducted,
      token,
    })
  );

  const priceStore = $derived(tokenPriceStore(tokenAmount));
  const tokenPrice = $derived($priceStore);

  const tokenAmountUsdValue = $derived.by(() => {
    if (isNullish(tokenAmount) || isNullish(tokenPrice)) return undefined;

    const usdValue = getUsdValue({ amount: tokenAmount, tokenPrice });
    return nonNullish(usdValue) ? formatUsdValue(usdValue) : undefined;
  });

  const transactionFeeUsdValue = $derived.by(() => {
    if (isNullish(transactionFee) || isNullish(tokenPrice)) return undefined;

    const feeAmount = toTokenAmountV2(transactionFee);
    const usdValue = getUsdValue({ amount: feeAmount, tokenPrice });
    return nonNullish(usdValue) ? formatUsdValue(usdValue) : undefined;
  });
</script>

<article class="container" data-tid="transaction-summary-component">
  <KeyValuePair testId="transaction-summary-sending-amount">
    <span class="label" slot="key">{$i18n.accounts.sending_amount}</span>
    <div slot="value" class="value">
      <AmountDisplay
        singleLine
        detailed
        amount={tokenAmount}
      />{#if nonNullish(tokenAmountUsdValue)}
        <span class="fiat" data-tid="fiat-value">
          (~{tokenAmountUsdValue})
        </span>
      {/if}
    </div>
  </KeyValuePair>

  {#if showLedgerFee}
    <KeyValuePair testId="transaction-summary-fee">
      <span class="label" slot="key">{ledgerFeeLabel}</span>
      <div class="value" slot="value">
        <AmountDisplay
          singleLine
          detailed
          amount={transactionFee}
        />{#if nonNullish(transactionFeeUsdValue)}
          <span class="fiat" data-tid="fiat-value">
            ({transactionFeeUsdValue})
          </span>
        {/if}
      </div>
    </KeyValuePair>

    <div class="deducted" data-tid="transaction-summary-total-deducted">
      <p class="label subtitle">{$i18n.accounts.total_deducted}</p>

      <p>
        <AmountDisplay inline detailed amount={tokenTotalDeducted} />
      </p>
    </div>
  {/if}

  <div class="icon">
    <IconSouth />
  </div>

  {@render receivedAmount()}
</article>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);

    padding: var(--padding-2x) 0;

    &:before,
    &:after {
      content: "";
    }

    &:before {
      border-top: 1px solid var(--elements-divider);
      padding: 0 0 var(--padding);
    }

    &:after {
      border-bottom: 1px solid var(--elements-divider);
      padding: var(--padding) 0 0;
    }
  }

  .icon {
    margin: var(--padding) 0;
  }

  @include media.light-theme {
    .icon {
      color: var(--primary);
    }
  }

  p {
    margin: 0;
  }

  .deducted {
    margin: var(--padding) 0 0;
  }

  .subtitle {
    margin: 0 0 var(--padding-0_5x);
  }

  .value {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .fiat {
      color: var(--text-description);
    }
  }
</style>
