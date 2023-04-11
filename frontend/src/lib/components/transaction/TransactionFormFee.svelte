<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TokenAmount } from "@dfinity/nns";

  export let transactionFee: TokenAmount;
</script>

<p class="fee description">
  <slot name="label">{$i18n.accounts.transaction_fee}</slot>: <AmountDisplay
    amount={transactionFee}
    singleLine
  />
</p>

<style lang="scss">
  .fee {
    text-align: right;
    padding-top: var(--padding-0_5x);
  }
</style>
