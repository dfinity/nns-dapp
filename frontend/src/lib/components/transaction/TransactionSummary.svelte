<script lang="ts">
  import type { Token } from "@dfinity/nns";
  import { TokenAmount } from "@dfinity/nns";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconSouth, KeyValuePair } from "@dfinity/gix-components";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import en from "../../../tests/mocks/i18n.mock";

  export let amount: number;
  export let token: Token;
  export let transactionFee: TokenAmount;

  // If we made it this far, the number is valid.
  let tokenAmount: TokenAmount;
  $: tokenAmount = TokenAmount.fromNumber({
    amount,
    token,
  });

  let ledgerFeeLabel: string;
  $: ledgerFeeLabel = replacePlaceholders(en.accounts.token_transaction_fee, {
    $tokenSymbol: token.symbol,
  });

  let totalDeducted: bigint;
  $: totalDeducted = tokenAmount.toE8s() + transactionFee.toE8s();

  let tokenTotalDeducted: TokenAmount;
  $: tokenTotalDeducted = TokenAmount.fromE8s({
    amount: totalDeducted,
    token,
  });
</script>

<Separator />

<KeyValuePair>
  <span class="label" slot="key">{$i18n.accounts.sending_amount}</span>
  <AmountDisplay slot="value" singleLine detailed amount={tokenAmount} />
</KeyValuePair>

<KeyValuePair>
  <span class="label" slot="key">{ledgerFeeLabel}</span>
  <AmountDisplay slot="value" singleLine detailed amount={transactionFee} />
</KeyValuePair>

<p class="label">
  {$i18n.accounts.total_deducted}
</p>

<p>
  <AmountDisplay inline detailed amount={tokenTotalDeducted} />
</p>

<div class="icon">
  <IconSouth />
</div>

<Separator />

<style lang="scss">
  .icon {
    color: var(--primary);

    :global(svg) {
      height: var(--padding-3x);
    }
  }
</style>
