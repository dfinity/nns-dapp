<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TokenAmount } from "@dfinity/nns";

  export let transactionFee: TokenAmount;
</script>

<div data-tid="transaction-form-fee">
  <p class="fee label no-margin">
    <slot name="label">{$i18n.accounts.transaction_fee}</slot>
  </p>

  <p class="no-margin"><AmountDisplay amount={transactionFee} singleLine /></p>
</div>

<style lang="scss">
  .fee {
    padding: var(--padding-0_5x) 0;
  }
</style>
