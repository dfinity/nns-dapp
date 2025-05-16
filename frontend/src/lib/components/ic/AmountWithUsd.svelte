<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { isPrivacyModeStore } from "$lib/derived/privacy-mode.derived";
  import { balancesVisibility } from "$lib/stores/balances-visibility.store";
  import {
    formatNumber,
    renderPrivacyModeBalance,
  } from "$lib/utils/format.utils";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import { nonNullish, TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    amount: TokenAmountV2 | UnavailableTokenAmount;
    amountInUsd: number | undefined;
  };

  const { amount, amountInUsd }: Props = $props();

  const privacyMode = $derived($isPrivacyModeStore);

  $effect(() => {
    console.log($balancesVisibility);

    balancesVisibility.set("hide");
    console.log(privacyMode);
  });
</script>

<div class="values" data-tid="amount-with-usd-component">
  <AmountDisplay singleLine {amount} {privacyMode} />
  <span data-tid="usd-value" class="usd-value">
    {#if privacyMode}
      {renderPrivacyModeBalance(3)}
    {:else if nonNullish(amountInUsd)}
      ${formatNumber(amountInUsd)}
    {:else}
      $-/-
    {/if}
  </span>
</div>

<style lang="scss">
  .values {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
    align-items: flex-end;

    .usd-value {
      color: var(--text-description);
      font-size: var(--font-size-small);
    }
  }
</style>
