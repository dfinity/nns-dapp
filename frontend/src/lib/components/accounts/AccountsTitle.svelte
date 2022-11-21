<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { INTERNET_COMPUTER, IC_LOGO } from "$lib/constants/icp.constants";

  export let balance: TokenAmount | undefined;
  export let logo = IC_LOGO;
  export let title = INTERNET_COMPUTER;

  let totalTokens: string;
  $: totalTokens =
    balance !== undefined
      ? formatToken({
          value: balance.toE8s(),
          detailed: true,
        })
      : "";
</script>

<div class="summary">
  <Logo src={logo} alt="" size="big" framed={false} />

  <div data-tid="accounts-total">
    <h1 data-tid="accounts-title">{title}</h1>
    {#if balance !== undefined}
      <Tooltip
        id="wallet-total-icp"
        text={replacePlaceholders($i18n.accounts.current_balance_total, {
          $amount: totalTokens,
        })}
      >
        <AmountDisplay inline amount={balance} />
      </Tooltip>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .summary {
    display: grid;
    grid-template-columns: repeat(2, auto);

    margin: var(--padding) 0 var(--padding-3x);
    --amount-color: var(--content-color);

    gap: var(--padding-2x);
  }

  div {
    width: fit-content;
  }

  h1 {
    display: inline-block;
  }
</style>
