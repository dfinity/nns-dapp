<script lang="ts">
  import { TokenAmountV2, type Token } from "@dfinity/utils";
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";

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
