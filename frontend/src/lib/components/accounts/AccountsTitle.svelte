<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import Summary from "$lib/components/nav/Summary.svelte";

  export let balance: TokenAmount | undefined;

  let totalTokens: string;
  $: totalTokens =
    balance !== undefined
      ? formatToken({
          value: balance.toE8s(),
          detailed: true,
        })
      : "";
</script>

<Summary>
  <div class="details" slot="details">
    {#if balance !== undefined}
      <Tooltip
        id="wallet-total-icp"
        text={replacePlaceholders($i18n.accounts.current_balance_total, {
          $amount: totalTokens,
        })}
      >
        <AmountDisplay copy amount={balance} >
          <span>Total balance is</span>
        </AmountDisplay>
      </Tooltip>
    {/if}
  </div>
</Summary>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .details {
    color: var(--description-color);
    @include fonts.small;
  }
</style>