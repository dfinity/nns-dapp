<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { numberToE8s } from "$lib/utils/token.utils";
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
  import { TokenAmount } from "@dfinity/nns";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import BitcoinEstimatedFeeDisplay from "$lib/components/accounts/BitcoinEstimatedFeeDisplay.svelte";

  export let amount: number | undefined = undefined;
  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;
  export let token: IcrcTokenMetadata;

  let amountE8s = BigInt(0);
  $: amountE8s = nonNullish(amount) ? numberToE8s(amount) : BigInt(0);

  let estimatedAmount = BigInt(0);
  $: estimatedAmount =
    nonNullish(bitcoinEstimatedFee) && amountE8s > bitcoinEstimatedFee
      ? amountE8s - bitcoinEstimatedFee
      : BigInt(0);

  let tokenEstimatedAmount: TokenAmount;
  $: tokenEstimatedAmount = TokenAmount.fromE8s({
    amount: estimatedAmount,
    token,
  });
</script>

<TransactionReceivedTokenAmount
  amount={tokenEstimatedAmount}
  testId="bitcoin-estimated-amount"
>
  <svelte:fragment slot="label"
    >{$i18n.accounts.estimated_amount_received}</svelte:fragment
  >
</TransactionReceivedTokenAmount>

<BitcoinEstimatedFeeDisplay {bitcoinEstimatedFee} />
