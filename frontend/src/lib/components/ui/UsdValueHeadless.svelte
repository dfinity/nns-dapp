<script lang="ts">
  import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { tickersStore } from "$lib/stores/tickers.store";
  import {
    formatCurrencyNumber,
    formatNumber,
    renderPrivacyModeBalance,
  } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  export type ChildrenProps = {
    hasError: boolean;
    hasPricesAndUnpricedTokens: boolean;
    icpAmountFormatted: string;
    icpPrice: number | undefined;
    usdAmountFormatted: string;
  };

  type Props = {
    absentValue?: string;
    children: Snippet<[ChildrenProps]>;
    hasUnpricedTokens: boolean;
    usdAmount: number | undefined;
  };

  const {
    usdAmount,
    hasUnpricedTokens = false,
    absentValue = PRICE_NOT_AVAILABLE_PLACEHOLDER,
    children,
  }: Props = $props();

  const hasError = $derived($tickersStore === "error");
  const hasPrices = $derived(!hasError && nonNullish($tickersStore));
  const hasPricesAndUnpricedTokens = $derived(hasPrices && hasUnpricedTokens);

  const usdAmountFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(5)
      : nonNullish(usdAmount) && hasPrices
        ? formatCurrencyNumber(usdAmount)
        : absentValue
  );
  const icpPrice = $derived(
    isNullish($tickersStore) || $tickersStore === "error"
      ? undefined
      : $tickersStore[LEDGER_CANISTER_ID.toText()]
  );

  const icpAmount = $derived(
    nonNullish(usdAmount) && nonNullish(icpPrice)
      ? usdAmount / icpPrice
      : undefined
  );
  const icpAmountFormatted = $derived(
    $isBalancePrivacyOptionStore
      ? renderPrivacyModeBalance(3)
      : nonNullish(icpAmount)
        ? formatNumber(icpAmount)
        : absentValue
  );
</script>

{@render children({
  icpPrice,
  usdAmountFormatted,
  icpAmountFormatted,
  hasPricesAndUnpricedTokens,
  hasError,
})}
