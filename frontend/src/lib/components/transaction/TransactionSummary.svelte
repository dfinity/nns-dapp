<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";
  import { IconSouth, KeyValuePair } from "@dfinity/gix-components";
  import { TokenAmount, TokenAmountV2, type Token } from "@dfinity/utils";
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
</script>

<article class="container">
  <KeyValuePair testId="transaction-summary-sending-amount">
    <span class="label" slot="key">{$i18n.accounts.sending_amount}</span>
    <AmountDisplay slot="value" singleLine detailed amount={tokenAmount} />
  </KeyValuePair>

  {#if showLedgerFee}
    <KeyValuePair testId="transaction-summary-fee">
      <span class="label" slot="key">{ledgerFeeLabel}</span>
      <AmountDisplay slot="value" singleLine detailed amount={transactionFee} />
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
</style>
