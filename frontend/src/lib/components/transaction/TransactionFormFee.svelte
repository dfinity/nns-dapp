<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TokenAmount, TokenAmountV2 } from "@dfinity/utils";

  export let transactionFee: TokenAmount | TokenAmountV2;
</script>

<div data-tid="transaction-form-fee">
  <p class="fee label no-margin">
    <slot name="label">{$i18n.accounts.transaction_fee}</slot>
  </p>

  <p class="no-margin">
    <AmountDisplay
      amount={transactionFee}
      singleLine
      detailed="height_decimals"
    />
  </p>
</div>

<style lang="scss">
  .fee {
    padding: var(--padding-0_5x) 0;
  }
</style>
