<script lang="ts">
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
  import { TokenAmountV2, type Token } from "@dfinity/utils";

  export let amount: number;
  export let token: Token;

  let tokenAmount: TokenAmountV2;
  $: tokenAmount = TokenAmountV2.fromNumber({
    amount,
    token,
  });
</script>

<TransactionReceivedTokenAmount
  amount={tokenAmount}
  testId="transaction-summary-total-received"
/>
