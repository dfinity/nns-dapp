<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { numberToE8s } from "$lib/utils/token.utils";
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
  import { TokenAmount } from "@dfinity/nns";
  import BitcoinEstimatedFeeDisplay from "$lib/components/accounts/BitcoinEstimatedFeeDisplay.svelte";
  import type { Token } from "@dfinity/nns/dist/types/token";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";

  export let amount: number | undefined = undefined;
  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;
  export let universeId: UniverseCanisterId;

  let bitcoinLabel: string;
  $: bitcoinLabel = isUniverseCkTESTBTC(universeId)
    ? $i18n.ckbtc.test_bitcoin
    : $i18n.ckbtc.bitcoin;

  let token: Token;
  $: token = {
    symbol: $i18n.ckbtc.btc,
    name: bitcoinLabel,
  };

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
  testId="bitcoin-estimated-amount-value"
  estimation
/>

<BitcoinEstimatedFeeDisplay {bitcoinEstimatedFee} />
