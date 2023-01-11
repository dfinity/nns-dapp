<script lang="ts">
  import { nonNullish } from "$lib/utils/utils";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { formatToken } from "$lib/utils/token.utils";

  let totalBalance: string;
  $: totalBalance = nonNullish($selectedProjectBalance.balance)
    ? formatToken({
        value: $selectedProjectBalance.balance.toE8s(),
        detailed: true,
      })
    : "";

  let tokenSymbol: string;
  $: tokenSymbol = $selectedProjectBalance.balance?.token.symbol ?? "";
</script>

{#if nonNullish($selectedProjectBalance.balance)}
  <Tooltip
    containerSelector=".start"
    id="wallet-total-icp"
    text={replacePlaceholders($i18n.accounts.current_balance_total, {
      $amount: totalBalance,
      $token: tokenSymbol,
    })}
  >
    <AmountDisplay copy amount={$selectedProjectBalance.balance} />
  </Tooltip>
{:else}
  <div class="skeleton">
    <SkeletonText />
  </div>
{/if}

<style lang="scss">
  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-4x);
    box-sizing: border-box;
    padding: var(--padding-0_5x) 0;
    max-width: 240px;
  }
</style>
