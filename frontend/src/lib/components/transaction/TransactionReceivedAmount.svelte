<script lang="ts">
  import { TokenAmount, type Token } from "@dfinity/utils";
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";

  export let amount: number;
  export let token: Token;

  let tokenAmount: TokenAmount;
  $: tokenAmount = TokenAmount.fromNumber({
    amount,
    token,
  });
</script>

<TransactionReceivedTokenAmount
  amount={tokenAmount}
  testId="transaction-summary-total-received"
/>
