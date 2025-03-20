<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { icpSwapUsdPricesStore } from "$lib/derived/icp-swap.derived";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber } from "$lib/utils/format.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, TokenAmountV2, type Token } from "@dfinity/utils";

  export let amount: number = 0;
  export let balance: bigint | undefined = undefined;
  export let token: Token;
  export let errorState: boolean = false;

  let ledgerCanisterId: Principal | undefined;
  $: ledgerCanisterId = getLedgerCanisterIdFromUniverse($selectedUniverseStore);

  let tokenPrice: number | undefined;
  $: tokenPrice =
    nonNullish(ledgerCanisterId) &&
    nonNullish($icpSwapUsdPricesStore) &&
    $icpSwapUsdPricesStore !== "error"
      ? $icpSwapUsdPricesStore[ledgerCanisterId.toText()]
      : undefined;

  let tokens: TokenAmountV2;
  $: tokens = TokenAmountV2.fromNumber({ amount, token });

  let usdValue: number;
  $: usdValue = getUsdValue({ amount: tokens, tokenPrice }) ?? 0;

  let usdValueFormatted: string;
  $: usdValueFormatted = formatNumber(usdValue);
</script>

<div
  class="wrapper"
  class:has-error={errorState}
  data-tid="amount-input-fiat-value-component"
>
  <span class="fiat" data-tid="fiat-value">
    ${usdValueFormatted}
  </span>
  {#if nonNullish(balance)}
    <span class="balance" data-tid="balance">
      <span>
        {$i18n.accounts.balance}:
      </span>
      <AmountDisplay
        singleLine
        amount={TokenAmountV2.fromUlps({
          amount: balance,
          token,
        })}
      />
    </span>
  {/if}
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

  .wrapper.has-error {
    .balance {
      color: var(--negative-emphasis);
      --amount-color: var(--negative-emphasis);
    }
  }
</style>
