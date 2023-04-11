<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { TokenAmount } from "@dfinity/nns";

  export let transactionFee: TokenAmount;
</script>

<p class="fee description">
  {$i18n.accounts.transaction_fee}: <AmountDisplay
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
