<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { numberToE8s } from "$lib/utils/token.utils";
  import TransactionReceivedTokenAmount from "$lib/components/transaction/TransactionReceivedTokenAmount.svelte";
  import BitcoinFeeDisplay from "$lib/components/accounts/BitcoinFeeDisplay.svelte";
  import { TokenAmount, type Token } from "@dfinity/utils";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import {
    ckBTCInfoStore,
    type CkBTCInfoStoreUniverseData,
  } from "$lib/stores/ckbtc-info.store";

  export let amount: number | undefined = undefined;
  export let bitcoinEstimatedFee: bigint | undefined | null = undefined;
  export let universeId: UniverseCanisterId;

  let infoData: CkBTCInfoStoreUniverseData | undefined = undefined;
  $: infoData = $ckBTCInfoStore[universeId.toText()];

  let kytEstimatedFee: bigint | undefined = undefined;
  $: kytEstimatedFee = infoData?.info.kyt_fee;

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

  let estimatedFee = BigInt(0);
  $: estimatedFee =
    (bitcoinEstimatedFee ?? BigInt(0)) + (kytEstimatedFee ?? BigInt(0));

  let estimatedAmount = BigInt(0);
  $: estimatedAmount =
    nonNullish(bitcoinEstimatedFee) &&
    nonNullish(kytEstimatedFee) &&
    amountE8s > estimatedFee
      ? amountE8s - estimatedFee
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

<BitcoinFeeDisplay
  fee={bitcoinEstimatedFee}
  testId="bitcoin-estimated-fee-display"
>
  {$i18n.accounts.bitcoin_transaction_fee_notice}
</BitcoinFeeDisplay>

<BitcoinFeeDisplay fee={kytEstimatedFee} testId="kyt-estimated-fee-display">
  {$i18n.accounts.internetwork_fee_notice}
</BitcoinFeeDisplay>

<p>{$i18n.accounts.estimation_notice}</p>

<style lang="scss">
  p {
    margin: var(--padding) 0 0;
  }
</style>
