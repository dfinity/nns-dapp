<script lang="ts">
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
  import { TokenAmountV2, type Token } from "@dfinity/utils";

  type Props = {
    amount: number;
    token: Token;
  };

  const { amount, token }: Props = $props();

  const tokenAmount = $derived(
    TokenAmountV2.fromNumber({
      amount,
      token,
    })
  );
</script>

<TransactionReceivedTokenAmount
  amount={tokenAmount}
  testId="transaction-summary-total-received"
/>
