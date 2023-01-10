<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  export let balance: TokenAmount | undefined;

  let totalTokens: string;
  $: totalTokens =
    balance !== undefined
      ? formatToken({
          value: balance.toE8s(),
          detailed: true,
        })
      : "";

  let tokenSymbol: string;
  $: tokenSymbol = balance?.token.symbol ?? "";
</script>

{#if balance !== undefined}
  <Tooltip
    id="wallet-total-icp"
    text={replacePlaceholders($i18n.accounts.current_balance_total, {
      $amount: totalTokens,
      $token: tokenSymbol,
    })}
  >
    <AmountDisplay copy amount={balance} />
  </Tooltip>
{/if}
