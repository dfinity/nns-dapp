<script lang="ts">
  import { TokenAmount, TokenAmountV2, type Token } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { IconSouth, KeyValuePair } from "@dfinity/gix-components";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";

  export let amount: number;
  export let token: Token;
  export let transactionFee: TokenAmount | TokenAmountV2;
  export let showLedgerFee = true;

  // If we made it this far, the number is valid.
  let tokenAmount: TokenAmountV2;
  $: tokenAmount = TokenAmountV2.fromNumber({
    amount,
    token,
  });

  let ledgerFeeLabel: string;
  $: ledgerFeeLabel = replacePlaceholders(
    $i18n.accounts.token_transaction_fee,
    {
      $tokenSymbol: token.symbol,
    }
  );

  let totalDeducted: bigint;
  $: totalDeducted =
    tokenAmount.toUlps() + toTokenAmountV2(transactionFee).toUlps();

  let tokenTotalDeducted: TokenAmountV2;
  $: tokenTotalDeducted = TokenAmountV2.fromUlps({
    amount: totalDeducted,
    token,
  });
</script>

<article class="container">
  <KeyValuePair testId="transaction-summary-sending-amount">
    <span class="label" slot="key">{$i18n.accounts.sending_amount}</span>
    <AmountDisplay
      slot="value"
      singleLine
      detailed="height_decimals"
      amount={tokenAmount}
    />
  </KeyValuePair>

  {#if showLedgerFee}
    <KeyValuePair testId="transaction-summary-fee">
      <span class="label" slot="key">{ledgerFeeLabel}</span>
      <AmountDisplay
        slot="value"
        singleLine
        detailed="height_decimals"
        amount={transactionFee}
      />
    </KeyValuePair>

    <div class="deducted" data-tid="transaction-summary-total-deducted">
      <p class="label subtitle">{$i18n.accounts.total_deducted}</p>

      <p>
        <AmountDisplay
          inline
          detailed="height_decimals"
          amount={tokenTotalDeducted}
        />
      </p>
    </div>
  {/if}

  <div class="icon">
    <IconSouth />
  </div>

  <slot name="received-amount" />
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
      border-top: 1px solid var(--line);
      padding: 0 0 var(--padding);
    }

    &:after {
      border-bottom: 1px solid var(--line);
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
</style>
