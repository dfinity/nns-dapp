<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  export let balance: TokenAmount | undefined;

  let totalTokens: string;
  totalTokens =
    balance !== undefined
      ? formatToken({
          value: balance.toE8s(),
          detailed: true,
        })
      : "";
</script>

<div data-tid="accounts-total">
  {#if balance !== undefined}
    <Tooltip
      id="wallet-total-icp"
      text={replacePlaceholders($i18n.accounts.current_balance_total, {
        $amount: totalTokens,
      })}
    >
      <AmountDisplay title amount={balance}>
        <h1 data-tid="accounts-title">{$i18n.accounts.total}</h1>
      </AmountDisplay>
    </Tooltip>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  div {
    margin-bottom: var(--padding-2x);
    --amount-color: var(--content-color);
  }

  h1 {
    display: inline-block;
  }
</style>
