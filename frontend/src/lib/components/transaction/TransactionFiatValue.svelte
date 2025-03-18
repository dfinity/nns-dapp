<script lang="ts">
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { formatNumber } from "$lib/utils/format.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, TokenAmountV2, type Token } from "@dfinity/utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";

  export let amount: number;
  export let balance: bigint | undefined;
  export let token: Token;

  let ledgerCanisterId: Principal | undefined;
  $: ledgerCanisterId = getLedgerCanisterIdFromUniverse($selectedUniverseStore);

  let hasError: boolean;
  $: hasError = $icpSwapUsdPricesStore === "error";

  let hasPrices: boolean;
  $: hasPrices = !hasError && nonNullish($icpSwapUsdPricesStore);

  let tokenPrice: number | undefined;
  $: tokenPrice = hasPrices
    ? $icpSwapUsdPricesStore?.[ledgerCanisterId.toText()]
    : undefined;

  let tokens: TokenAmountV2 | undefined;
  $: tokens = TokenAmountV2.fromNumber({ amount, token });

  let usdValue: number;
  $: usdValue = getUsdValue({ amount: tokens, tokenPrice }) ?? 0;

  let usdValueFormatted: string;
  $: usdValueFormatted = formatNumber(usdValue);
</script>

<div data-tid="transaction-form-fiat" class="wrapper">
  <span class="fiat">
    ${usdValueFormatted}
  </span>
  <span class="balance">
    Balance:
    <AmountDisplay
      singleLine
      amount={TokenAmountV2.fromUlps({
        amount: balance ?? BigInt(0),
        token,
      })}
    />
  </span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
    }

    .fiat {
      color: var(--text-description);
      @include fonts.standard(true);
    }

    .balance {
      margin: 0;
      padding: 0;
      color: var(--text-description);

      --amount-color: var(--text-description);
      --amount-weight: var(--font-weight-bold);

      @include fonts.standard(true);
    }
  }
</style>
